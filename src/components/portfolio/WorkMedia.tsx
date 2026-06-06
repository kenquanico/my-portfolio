import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    createMediaMetadata,
    type MediaMetadata,
    type MediaOrientation,
    type PortfolioAsset,
} from "../../data/portfolioAssets";

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
let activeVideo: HTMLVideoElement | null = null;

export function pauseActiveVideo() {
    activeVideo?.pause();
    activeVideo = null;
}

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

const WorkMedia = memo(function WorkMedia({ project, mode, kind, fit, reduceMotion = false }: MediaPreviewProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [metadata, updateMetadata] = useCachedMetadata(project, kind);
    const [loaded, setLoaded] = useState(() => metadataCache.has(project.src));
    const [paused, setPaused] = useState(true);
    const [hovered, setHovered] = useState(false);
    const isLogo = kind === "logos";
    const isVideo = project.kind === "video";
    const objectFit: MediaFit = fit ?? (mode === "thumb" && !isLogo ? "cover" : "contain");
    const showPlayButton = paused || hovered;

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
        background: isLogo ? "#fff" : "#050505",
        opacity: loaded ? 1 : 0,
        transition: reduceMotion ? "none" : "opacity 0.22s ease",
    }), [isLogo, loaded, objectFit, reduceMotion]);

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
            if (activeVideo && activeVideo !== video) activeVideo.pause();
            activeVideo = video;
            await video.play();
            setPaused(false);
        } else {
            pauseVideo();
        }
    }, [pauseVideo]);

    const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
        const img = event.currentTarget;
        updateMetadata(img.naturalWidth, img.naturalHeight);
        setLoaded(true);
    }, [updateMetadata]);

    const handleVideoMetadata = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = event.currentTarget;
        updateMetadata(video.videoWidth, video.videoHeight);
        setLoaded(true);
    }, [updateMetadata]);

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
                        loading="lazy"
                        decoding="async"
                        onLoad={handleImageLoad}
                        style={{ ...mediaStyle, maxWidth: "82%", maxHeight: "82%" }}
                    />
                </div>
            ) : isVideo ? (
                <>
                    <video
                        ref={videoRef}
                        src={project.src}
                        width={metadata.width}
                        height={metadata.height}
                        preload="metadata"
                        controls
                        playsInline
                        muted
                        onLoadedMetadata={handleVideoMetadata}
                        onPause={() => setPaused(true)}
                        onPlay={(event) => {
                            if (activeVideo && activeVideo !== event.currentTarget) activeVideo.pause();
                            activeVideo = event.currentTarget;
                            setPaused(false);
                        }}
                        style={mediaStyle}
                    />
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
                    loading="lazy"
                    decoding="async"
                    onLoad={handleImageLoad}
                    style={mediaStyle}
                />
            )}
            <div className="media-top-line" />
        </div>
    );
});

export default WorkMedia;
