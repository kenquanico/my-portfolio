import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    createMediaMetadata,
    type MediaMetadata,
    type MediaOrientation,
    type PortfolioAsset,
} from "../../data/portfolioAssetUtils";
import { pauseOtherVideo } from "./mediaPlayback";

export type WorkKind = "websites" | "graphics" | "logos";
export type MediaFit = "cover" | "contain";

interface MediaPreviewProps {
    project: PortfolioAsset;
    mode: "thumb" | "modal" | "swatch";
    kind: WorkKind;
    fit?: MediaFit;
    reduceMotion?: boolean;
}

const metadataCache = new Map<string, MediaMetadata>();
const posterCache = new Map<string, string>();
const thumbnailStateCache = new Map<string, { loaded: boolean; error: boolean; seen: boolean }>();

function defaultMetadata(kind: WorkKind): MediaMetadata {
    if (kind === "logos") return createMediaMetadata(1, 1);
    return createMediaMetadata(16, 10);
}

function mediaHeight(mode: MediaPreviewProps["mode"], orientation: MediaOrientation, ratio: number) {
    if (mode === "swatch") return 56;
    if (mode === "thumb") {
        if (orientation === "portrait") return 260;
        if (orientation === "square") return 220;
        return Math.max(170, Math.min(230, 260 / Math.max(ratio, 1)));
    }
    if (orientation === "portrait") return "min(62vh, 560px)";
    if (orientation === "square") return "min(54vh, 430px)";
    return `min(48vh, ${Math.round(330 / Math.max(ratio, 1) + 130)}px)`;
}

function PlayPauseIcon({ paused }: { paused: boolean }) {
    return paused ? (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
    ) : (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
    );
}

function useCachedMetadata(src: string, kind: WorkKind) {
    const [metadata, setMetadata] = useState<MediaMetadata>(() => metadataCache.get(src) ?? defaultMetadata(kind));

    const updateMetadata = useCallback((width: number, height: number) => {
        const next = createMediaMetadata(width, height);
        const cached = metadataCache.get(src);
        if (cached?.width === next.width && cached.height === next.height) return;
        metadataCache.set(src, next);
        setMetadata(next);
    }, [src]);

    return [metadata, updateMetadata] as const;
}

function getCachedThumbnailState(src: string) {
    return thumbnailStateCache.get(src) ?? { loaded: false, error: false, seen: false };
}

const WorkMediaContent = memo(function WorkMediaContent({ project, mode, kind, fit, reduceMotion = false }: MediaPreviewProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const carouselItems = project.carouselItems ?? [];
    const hasCarousel = carouselItems.length > 1;
    const [activeSlide, setActiveSlide] = useState(0);
    const activeCarouselItem = hasCarousel ? carouselItems[activeSlide % carouselItems.length] : undefined;
    const mediaSrc = project.kind === "video"
        ? activeCarouselItem?.src ?? project.src
        : activeCarouselItem?.previewSrc ?? project.previewSrc ?? activeCarouselItem?.src ?? project.src;
    const mediaName = activeCarouselItem?.name ?? project.name;
    const [metadata, updateMetadata] = useCachedMetadata(mediaSrc, kind);
    const [generatedPoster, setGeneratedPoster] = useState(() => posterCache.get(mediaSrc) ?? "");
    const [thumbnailState, setThumbnailState] = useState(() => getCachedThumbnailState(mediaSrc));
    const [paused, setPaused] = useState(true);
    const [hovered, setHovered] = useState(false);
    const [videoRequested, setVideoRequested] = useState(false);
    const isLogo = kind === "logos";
    const isVideo = project.kind === "video";
    const isPreviewMode = mode === "thumb" || mode === "swatch";
    const posterSource = project.posterSrc ?? generatedPoster;
    const hasStaticPoster = Boolean(project.posterSrc);
    const objectFit: MediaFit = fit ?? (mode === "thumb" && !isLogo ? "cover" : "contain");
    const showPlayButton = paused || hovered;
    const loaded = thumbnailState.loaded || posterCache.has(mediaSrc) || (!isVideo && metadataCache.has(mediaSrc));
    const imageLoading = mode === "thumb" ? "lazy" : "eager";
    const needsFallbackPoster = isPreviewMode && !posterSource && !thumbnailState.error;
    const shouldLoadVideoSource = videoRequested || needsFallbackPoster;
    const showVideoFallback = isVideo && isPreviewMode && thumbnailState.error && !posterSource && paused;

    const updateThumbnailState = useCallback((next: Partial<{ loaded: boolean; error: boolean; seen: boolean }>) => {
        setThumbnailState((current) => {
            const merged = { ...current, ...next };
            thumbnailStateCache.set(mediaSrc, merged);
            return merged;
        });
    }, [mediaSrc]);

    const shellStyle = useMemo(() => ({
        aspectRatio: metadata.aspectRatio,
        height: mediaHeight(mode, metadata.orientation, metadata.aspectRatio),
        borderRadius: mode === "swatch" ? 12 : undefined,
    }), [metadata.aspectRatio, metadata.orientation, mode]);

    const logoInnerStyle = useMemo(() => ({
        width: "100%",
        height: "100%",
        padding: mode === "swatch" ? 10 : mode === "modal" ? 24 : 18,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }), [mode]);

    const mediaStyle = useMemo(() => ({
        width: "100%",
        height: "100%",
        display: "block",
        objectFit,
        objectPosition: "center",
        background: isLogo ? "#fff" : "#050505",
        opacity: loaded ? 1 : 0,
        transform: isPreviewMode && metadata.orientation === "portrait" ? "scale(1.22)" : "scale(1)",
        transformOrigin: "center",
        transition: reduceMotion ? "none" : "opacity 0.22s ease",
    }), [isLogo, loaded, metadata.orientation, objectFit, reduceMotion, isPreviewMode]);

    const previewVideoStyle = useMemo(() => ({
        ...mediaStyle,
        opacity: loaded && !paused ? 1 : 0,
    }), [loaded, mediaStyle, paused]);

    const posterStyle = useMemo(() => ({
        ...mediaStyle,
        opacity: posterSource && paused ? 1 : 0,
        position: "absolute" as const,
        inset: 0,
    }), [mediaStyle, paused, posterSource]);

    const pauseVideo = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.pause();
        setPaused(true);
    }, []);

    const togglePlayback = useCallback(async () => {
        const video = videoRef.current;
        if (!video) return;

        setVideoRequested(true);

        if (video.paused) {
            if (!video.currentSrc) {
                video.src = mediaSrc;
                video.load();
            }
            pauseOtherVideo(video);
            try {
                await video.play();
                setPaused(false);
            } catch {
                setPaused(true);
                updateThumbnailState({ loaded: true, error: true, seen: true });
            }
        } else {
            pauseVideo();
        }
    }, [pauseVideo, mediaSrc, updateThumbnailState]);

    const showPreviousSlide = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setActiveSlide((current) => (current - 1 + carouselItems.length) % carouselItems.length);
    }, [carouselItems.length]);

    const showNextSlide = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setActiveSlide((current) => (current + 1) % carouselItems.length);
    }, [carouselItems.length]);

    const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
        const img = event.currentTarget;
        updateMetadata(img.naturalWidth, img.naturalHeight);
        updateThumbnailState({ loaded: true, error: false, seen: true });
    }, [updateMetadata, updateThumbnailState]);

    const handleMediaError = useCallback(() => {
        updateThumbnailState({ loaded: true, error: true, seen: true });
    }, [updateThumbnailState]);

    const handleVideoMetadata = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = event.currentTarget;
        updateMetadata(video.videoWidth, video.videoHeight);
        if (!isPreviewMode || posterCache.has(mediaSrc)) {
            updateThumbnailState({ loaded: true, error: false, seen: true });
            return;
        }

        if (hasStaticPoster) return;

        try {
            video.currentTime = Math.min(0.12, Math.max(0, (video.duration || 1) - 0.01));
        } catch {
            updateThumbnailState({ loaded: true, error: true, seen: true });
        }
    }, [hasStaticPoster, isPreviewMode, mediaSrc, updateMetadata, updateThumbnailState]);

    const capturePoster = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
        if (!isPreviewMode) {
            updateThumbnailState({ loaded: true, error: false, seen: true });
            return;
        }

        const cachedPoster = posterCache.get(mediaSrc);
        if (cachedPoster) {
            setGeneratedPoster(cachedPoster);
            updateThumbnailState({ loaded: true, error: false, seen: true });
            return;
        }

        const video = event.currentTarget;
        if (!video.videoWidth || !video.videoHeight) {
            updateThumbnailState({ loaded: true, error: true, seen: true });
            return;
        }

        try {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d");
            if (!context) {
                updateThumbnailState({ loaded: true, error: true, seen: true });
                return;
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const poster = canvas.toDataURL("image/jpeg", 0.76);
            posterCache.set(mediaSrc, poster);
            setGeneratedPoster(poster);
            updateThumbnailState({ loaded: true, error: false, seen: true });
        } catch {
            updateThumbnailState({ loaded: true, error: true, seen: true });
        }
    }, [isPreviewMode, mediaSrc, updateThumbnailState]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !("IntersectionObserver" in window)) return pauseVideo;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry?.isIntersecting) pauseVideo();
        }, { threshold: 0.08 });

        observer.observe(video);
        return () => {
            observer.disconnect();
            pauseVideo();
        };
    }, [pauseVideo]);

    useEffect(() => {
        if (!isVideo || !isPreviewMode || posterSource || thumbnailState.loaded || thumbnailState.error) return;
        const timeout = window.setTimeout(() => {
            updateThumbnailState({ loaded: true, error: true, seen: true });
        }, 2500);
        return () => window.clearTimeout(timeout);
    }, [isPreviewMode, isVideo, posterSource, thumbnailState.error, thumbnailState.loaded, updateThumbnailState]);

    useEffect(() => {
        if (!hasCarousel || reduceMotion || hovered) return;
        const interval = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % carouselItems.length);
        }, mode === "modal" ? 3600 : 3000);
        return () => window.clearInterval(interval);
    }, [carouselItems.length, hasCarousel, hovered, mode, reduceMotion]);

    return (
        <div
            className={`media-shell media-shell-${mode} media-orientation-${metadata.orientation}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={shellStyle}
        >
            {!loaded && <div className="media-skeleton" />}
            {isLogo ? (
                <div style={logoInnerStyle}>
                    <img
                        src={mediaSrc}
                        alt={mediaName}
                        width={metadata.width}
                        height={metadata.height}
                        loading={imageLoading}
                        decoding="async"
                        onLoad={handleImageLoad}
                        onError={handleMediaError}
                        style={{ ...mediaStyle, maxWidth: "82%", maxHeight: "82%" }}
                    />
                </div>
            ) : isVideo ? (
                <>
                    <video
                        ref={videoRef}
                        src={shouldLoadVideoSource ? mediaSrc : undefined}
                        poster={posterSource || undefined}
                        width={metadata.width}
                        height={metadata.height}
                        preload={needsFallbackPoster ? "metadata" : "none"}
                        controls={!isPreviewMode}
                        playsInline
                        muted
                        onLoadedMetadata={handleVideoMetadata}
                        onLoadedData={capturePoster}
                        onSeeked={capturePoster}
                        onError={handleMediaError}
                        onPause={() => setPaused(true)}
                        onPlay={(event) => {
                            pauseOtherVideo(event.currentTarget);
                            setPaused(false);
                        }}
                        style={isPreviewMode ? previewVideoStyle : mediaStyle}
                    />
                    {isPreviewMode && posterSource && (
                        <img
                            src={posterSource}
                            alt={mediaName}
                            width={metadata.width}
                            height={metadata.height}
                            loading={imageLoading}
                            decoding="async"
                            onLoad={handleImageLoad}
                            onError={handleMediaError}
                            style={posterStyle}
                        />
                    )}
                    {showVideoFallback && (
                        <div className="media-video-fallback" aria-label={`${mediaName} preview`}>
                            <span>{mediaName}</span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            void togglePlayback();
                        }}
                        aria-label={paused ? "Play demo" : "Pause demo"}
                        title={paused ? "Play" : "Pause"}
                        className="media-play-button"
                        style={{
                            opacity: showPlayButton ? 1 : 0,
                            pointerEvents: showPlayButton ? "auto" : "none",
                        }}
                    >
                        <PlayPauseIcon paused={paused} />
                    </button>
                </>
            ) : (
                <img
                    src={mediaSrc}
                    alt={mediaName}
                    width={metadata.width}
                    height={metadata.height}
                    loading={imageLoading}
                    decoding="async"
                    onLoad={handleImageLoad}
                    onError={handleMediaError}
                    style={mediaStyle}
                />
            )}
            {hasCarousel && (
                <>
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            left: 12,
                            right: 12,
                            bottom: 12,
                            display: "flex",
                            justifyContent: "center",
                            gap: 5,
                            pointerEvents: "none",
                        }}
                    >
                        {carouselItems.map((item, index) => (
                            <span
                                key={item.src}
                                style={{
                                    width: activeSlide === index ? 18 : 6,
                                    height: 6,
                                    borderRadius: 999,
                                    background: activeSlide === index ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.32)",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                                    transition: reduceMotion ? "none" : "width 0.24s ease, background 0.24s ease",
                                }}
                            />
                        ))}
                    </div>
                    <button type="button" aria-label="Previous Mabpost slide" onClick={showPreviousSlide} className="media-carousel-button media-carousel-button-prev">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button type="button" aria-label="Next Mabpost slide" onClick={showNextSlide} className="media-carousel-button media-carousel-button-next">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </>
            )}
            {!isPreviewMode && <div className="media-top-line" />}
        </div>
    );
});

const WorkMedia = memo(function WorkMedia(props: MediaPreviewProps) {
    return <WorkMediaContent key={props.project.src} {...props} />;
});

export default WorkMedia;
