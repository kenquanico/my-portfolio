import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    createMediaMetadata,
    type MediaMetadata,
    type MediaOrientation,
    type PortfolioAsset,
} from "../../data/portfolioAssets";
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

function useCachedMetadata(project: PortfolioAsset, kind: WorkKind) {
    const [metadata, setMetadata] = useState<MediaMetadata>(() => metadataCache.get(project.src) ?? defaultMetadata(kind));

    const updateMetadata = useCallback((width: number, height: number) => {
        const next = createMediaMetadata(width, height);
        const cached = metadataCache.get(project.src);
        if (cached?.width === next.width && cached.height === next.height) return;
        metadataCache.set(project.src, next);
        setMetadata(next);
    }, [project.src]);

    return [metadata, updateMetadata] as const;
}

function getCachedThumbnailState(src: string) {
    return thumbnailStateCache.get(src) ?? { loaded: false, error: false, seen: false };
}

const WorkMediaContent = memo(function WorkMediaContent({ project, mode, kind, fit, reduceMotion = false }: MediaPreviewProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [metadata, updateMetadata] = useCachedMetadata(project, kind);
    const [generatedPoster, setGeneratedPoster] = useState(() => posterCache.get(project.src) ?? "");
    const [thumbnailState, setThumbnailState] = useState(() => getCachedThumbnailState(project.src));
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
    const loaded = thumbnailState.loaded || metadataCache.has(project.src) || posterCache.has(project.src);
    const imageLoading = isPreviewMode && !thumbnailState.seen ? "lazy" : "eager";
    const needsFallbackPoster = isPreviewMode && !posterSource && !thumbnailState.error;
    const shouldLoadVideoSource = !isPreviewMode || videoRequested || needsFallbackPoster;
    const showVideoFallback = isVideo && isPreviewMode && thumbnailState.error && !posterSource && paused;

    const updateThumbnailState = useCallback((next: Partial<{ loaded: boolean; error: boolean; seen: boolean }>) => {
        setThumbnailState((current) => {
            const merged = { ...current, ...next };
            thumbnailStateCache.set(project.src, merged);
            return merged;
        });
    }, [project.src]);

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

        if (video.paused) {
            setVideoRequested(true);
            if (!video.currentSrc) {
                video.src = project.src;
                video.load();
            }
            pauseOtherVideo(video);
            await video.play();
            setPaused(false);
        } else {
            pauseVideo();
        }
    }, [pauseVideo, project.src]);

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
        if (!isPreviewMode || posterCache.has(project.src)) {
            updateThumbnailState({ loaded: true, error: false, seen: true });
            return;
        }

        if (hasStaticPoster) return;

        try {
            video.currentTime = Math.min(0.12, Math.max(0, (video.duration || 1) - 0.01));
        } catch {
            updateThumbnailState({ loaded: true, error: true, seen: true });
        }
    }, [hasStaticPoster, isPreviewMode, project.src, updateMetadata, updateThumbnailState]);

    const capturePoster = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
        if (!isPreviewMode) {
            updateThumbnailState({ loaded: true, error: false, seen: true });
            return;
        }

        const cachedPoster = posterCache.get(project.src);
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
            posterCache.set(project.src, poster);
            setGeneratedPoster(poster);
            updateThumbnailState({ loaded: true, error: false, seen: true });
        } catch {
            updateThumbnailState({ loaded: true, error: true, seen: true });
        }
    }, [isPreviewMode, project.src, updateThumbnailState]);

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
                        src={project.src}
                        alt={project.name}
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
                        src={shouldLoadVideoSource ? project.src : undefined}
                        poster={posterSource || undefined}
                        width={metadata.width}
                        height={metadata.height}
                        preload={needsFallbackPoster || !isPreviewMode ? "metadata" : "none"}
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
                            alt={project.name}
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
                        <div className="media-video-fallback" aria-label={`${project.name} preview`}>
                            <span>{project.name}</span>
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
                    src={project.src}
                    alt={project.name}
                    width={metadata.width}
                    height={metadata.height}
                    loading={imageLoading}
                    decoding="async"
                    onLoad={handleImageLoad}
                    onError={handleMediaError}
                    style={mediaStyle}
                />
            )}
            {!isPreviewMode && <div className="media-top-line" />}
        </div>
    );
});

const WorkMedia = memo(function WorkMedia(props: MediaPreviewProps) {
    return <WorkMediaContent key={props.project.src} {...props} />;
});

export default WorkMedia;
