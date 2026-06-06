import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    createMediaMetadata,
    type MediaMetadata,
    type MediaOrientation,
    type PortfolioAsset,
} from "../../data/portfolioAssets";

type ViewMode = "grid" | "list";
type WorkKind = "websites" | "graphics" | "logos";
type MediaFit = "cover" | "contain";

interface WorkGalleryProps {
    id: WorkKind;
    eyebrow: string;
    title: string;
    emphasizedTitle: string;
    icon: React.ReactNode;
    projects: PortfolioAsset[];
}

interface WorkCardProps {
    project: PortfolioAsset;
    index: number;
    kind: WorkKind;
    onSelect: (project: PortfolioAsset) => void;
}

interface MediaPreviewProps {
    project: PortfolioAsset;
    mode: "thumb" | "modal" | "swatch";
    kind: WorkKind;
    fit?: MediaFit;
}

const metadataCache = new Map<string, MediaMetadata>();
let activeVideo: HTMLVideoElement | null = null;

const sharedCss = `
  .work-section-header { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 18px; }
  .work-section-title { display: flex; align-items: center; gap: 20px; min-width: 0; }
  .work-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
  .work-modal-card { width: min(780px, calc(100vw - 32px)); max-height: min(760px, calc(100vh - 32px)); }
  .work-modal-body { display: grid; grid-template-columns: minmax(250px, 330px) minmax(0, 1fr); gap: 30px; padding: 24px 26px 26px; min-height: 0; }
  .work-modal-copy { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
  .work-modal-media { width: 100%; align-self: center; }
  .media-shell { position: relative; overflow: hidden; width: 100%; background: rgba(255,255,255,0.04); }
  .media-shell-thumb { height: auto; }
  .media-shell-swatch { width: 56px; height: 56px; }
  .media-shell-modal { max-height: min(62vh, 560px); }
  .media-orientation-portrait.media-shell-modal { max-width: min(280px, 100%); margin: 0 auto; border-radius: 24px; }
  .media-orientation-landscape.media-shell-modal { max-width: 100%; border-radius: 18px; }
  .media-orientation-square.media-shell-modal { max-width: min(430px, 100%); margin: 0 auto; border-radius: 18px; }
  .media-skeleton { position: absolute; inset: 0; background: linear-gradient(110deg, rgba(255,255,255,0.04), rgba(255,255,255,0.11), rgba(255,255,255,0.04)); background-size: 220% 100%; animation: media-shimmer 1.25s ease-in-out infinite; }
  @keyframes media-shimmer { from { background-position: 120% 0; } to { background-position: -120% 0; } }
  @media (max-width: 760px) {
    .work-section-header { align-items: flex-start; flex-direction: column; }
    .work-modal-card { overflow-y: auto; }
    .work-modal-body { grid-template-columns: 1fr; gap: 22px; }
    .work-modal-copy { padding-left: 0; }
    .media-shell-modal { max-height: min(54vh, 430px); }
  }
  @media (max-width: 560px) {
    .work-section-title { align-items: flex-start; }
    .work-list-row { align-items: flex-start !important; flex-wrap: wrap; gap: 12px !important; }
    .work-list-meta { margin-left: 68px; }
  }
`;

const sectionStyle = { padding: "100px 0 80px" };
const logosSectionStyle = { padding: "100px 0 120px" };
const dividerStyle = {
    height: "1px",
    background: "linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)",
};
const upperDividerStyle = {
    height: "1px",
    marginBottom: 100,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
};
const iconBoxStyle = {
    width: 40,
    height: 40,
    borderRadius: 11,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
};
const tagStyle = {
    fontFamily: "'Syne', sans-serif",
    fontSize: "9px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    padding: "3px 9px",
    borderRadius: 5,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "rgba(255,255,255,0.75)",
    whiteSpace: "nowrap" as const,
    marginTop: 2,
};

const glassBase = (hovered: boolean) => ({
    background: "transparent" as const,
    backdropFilter: "blur(24px) saturate(1.3)",
    WebkitBackdropFilter: "blur(24px) saturate(1.3)",
    border: `1px solid ${hovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)"}`,
    boxShadow: hovered
        ? "0 0 0 0.5px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)"
        : "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
    transition: "all 0.38s cubic-bezier(0.16,1,0.3,1)",
});

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
        metadataCache.set(project.src, next);
        setMetadata(next);
    }, [project.src]);

    return [metadata, updateMetadata] as const;
}

const MediaPreview = memo(function MediaPreview({ project, mode, kind, fit }: MediaPreviewProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [metadata, updateMetadata] = useCachedMetadata(project, kind);
    const [loaded, setLoaded] = useState(() => metadataCache.has(project.src));
    const [paused, setPaused] = useState(true);
    const isLogo = kind === "logos";
    const isVideo = project.kind === "video";
    const objectFit: MediaFit = fit ?? (mode === "thumb" && !isLogo ? "cover" : "contain");

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
        transition: "opacity 0.22s ease",
    }), [isLogo, loaded, objectFit]);

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

    useEffect(() => pauseVideo, [pauseVideo]);

    return (
        <div
            className={`media-shell media-shell-${mode} media-orientation-${metadata.orientation}`}
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
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: mode === "swatch" ? 34 : 56,
                            height: mode === "swatch" ? 34 : 56,
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.35)",
                            background: "rgba(0,0,0,0.56)",
                            color: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            boxShadow: "0 12px 32px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.22)",
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
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)", pointerEvents: "none" }} />
        </div>
    );
});

function ProjectModal({ project, kind, onClose }: { project: PortfolioAsset; kind: WorkKind; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => () => {
        activeVideo?.pause();
        activeVideo = null;
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <motion.div className="work-modal-card" initial={{ opacity: 0, scale: 0.91, y: 28 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 16 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()} style={{ borderRadius: 28, overflow: "hidden", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(48px) saturate(1.6)", WebkitBackdropFilter: "blur(48px) saturate(1.6)", border: "1px solid rgba(255,255,255,0.13)", boxShadow: "0 40px 120px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.2)", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.38) 45%, rgba(255,255,255,0.38) 55%, transparent 100%)", pointerEvents: "none", zIndex: 3 }} />
                <div style={{ padding: "22px 26px 0", display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2, flexShrink: 0 }}>
                    <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 9, padding: "6px 13px 6px 9px", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontFamily: "'Syne', sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", transition: "all 0.2s ease" }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        Back
                    </button>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 11px", borderRadius: 6, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.6)" }}>{project.tag}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)", marginLeft: "auto" }}>{project.year}</span>
                </div>
                <div className="work-modal-body">
                    <div className="work-modal-media">
                        <MediaPreview project={project} kind={kind} mode="modal" />
                    </div>
                    <div className="work-modal-copy">
                        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 10 }}>Project</p>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.1, color: "#fff", marginBottom: 6 }}>{project.name}</h3>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.5)", marginBottom: 22, lineHeight: 1.5 }}>{project.tagline}</p>
                        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 22 }} />
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(13px, 1.25vw, 15px)", fontWeight: 300, lineHeight: 1.85, color: "rgba(255,255,255,0.7)" }}>{project.description}</p>
                        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.32)", marginTop: 24 }}>{project.fileName}</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function ViewToggle({ mode, setMode }: { mode: ViewMode; setMode: (m: ViewMode) => void }) {
    return (
        <div style={{ display: "flex", gap: 4, padding: "4px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {(["grid", "list"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} title={`${m} view`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 26, borderRadius: 7, border: "none", cursor: "pointer", background: mode === m ? "rgba(255,255,255,0.14)" : "transparent", color: mode === m ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.38)", transition: "all 0.2s ease" }}>
                    {m === "grid" ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg> : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="1.5" /><rect x="3" y="10" width="18" height="5" rx="1.5" /><rect x="3" y="17" width="18" height="5" rx="1.5" /></svg>}
                </button>
            ))}
        </div>
    );
}

const WorkGridCard = memo(function WorkGridCard({ project, index, kind, onSelect }: WorkCardProps) {
    const [hovered, setHovered] = useState(false);
    const handleClick = useCallback(() => onSelect(project), [onSelect, project]);
    const badge = kind === "websites" ? project.kind : project.extension;

    return (
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={handleClick} style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer", transform: hovered ? "translateY(-4px)" : "translateY(0)", ...glassBase(hovered) }}>
            <div style={{ position: "relative", overflow: "hidden", padding: kind === "logos" ? 18 : 0, background: "rgba(255,255,255,0.04)" }}>
                <MediaPreview project={project} kind={kind} mode="thumb" fit={kind === "logos" ? "contain" : "cover"} />
                <div style={{ position: "absolute", top: 14, right: 14, fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 6, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)" }}>{badge}</div>
                <motion.div animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.25 }} style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.36) 0%, transparent 60%)", pointerEvents: "none" }} />
            </div>
            <div style={{ padding: kind === "websites" ? "20px 22px 22px" : "18px 20px 20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px, 1.6vw, 20px)", fontWeight: 400, letterSpacing: "-0.015em", color: "rgba(255,255,255,0.97)", lineHeight: 1.2 }}>{project.name}</p>
                    {kind === "websites" && <span style={tagStyle}>{project.tag}</span>}
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(12px, 1.2vw, 13px)", fontWeight: 300, color: "rgba(255,255,255,0.44)", marginBottom: 14, lineHeight: 1.5 }}>{project.tagline}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.27)" }}>{project.year}</span>
                    <motion.div animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.38 }} transition={{ duration: 0.2 }} style={{ color: "rgba(255,255,255,0.9)" }}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></motion.div>
                </div>
            </div>
        </motion.div>
    );
});

const WorkListRow = memo(function WorkListRow({ project, index, kind, onSelect }: WorkCardProps) {
    const [hovered, setHovered] = useState(false);
    const handleClick = useCallback(() => onSelect(project), [onSelect, project]);

    return (
        <motion.div className="work-list-row" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={handleClick} style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 20px", borderRadius: 14, cursor: "pointer", ...glassBase(hovered) }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", background: kind === "logos" ? "#fff" : "rgba(255,255,255,0.04)" }}>
                <MediaPreview project={project} kind={kind} mode="swatch" fit={kind === "logos" ? "contain" : "cover"} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.97)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,0.44)", lineHeight: 1.4 }}>{project.fileName}</p>
            </div>
            <div className="work-list-meta" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 5, flexShrink: 0, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.65)" }}>{project.tag}</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.27)", flexShrink: 0 }}>{project.year}</span>
                <motion.div animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.32 }} transition={{ duration: 0.2 }} style={{ color: "rgba(255,255,255,0.88)", flexShrink: 0 }}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></motion.div>
            </div>
        </motion.div>
    );
});

export default function WorkGallery({ id, eyebrow, title, emphasizedTitle, icon, projects }: WorkGalleryProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selected, setSelected] = useState<PortfolioAsset | null>(null);
    const orderedProjects = useMemo(() => projects, [projects]);
    const selectProject = useCallback((project: PortfolioAsset) => setSelected(project), []);
    const close = useCallback(() => setSelected(null), []);

    useEffect(() => {
        document.body.style.overflow = selected ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [selected]);

    return (
        <>
            <style>{sharedCss}</style>
            <AnimatePresence>{selected && <ProjectModal project={selected} kind={id} onClose={close} />}</AnimatePresence>
            <section id={id} style={id === "logos" ? logosSectionStyle : sectionStyle}>
                {id !== "websites" && <div style={upperDividerStyle} />}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 52 }}>
                    <div className="work-section-header">
                        <div className="work-section-title">
                            <div style={iconBoxStyle}>{icon}</div>
                            <div>
                                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", marginBottom: 4 }}>{eyebrow}</p>
                                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 3.2vw, 48px)", fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.08, color: "#fff" }}>{title} <em style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>{emphasizedTitle}</em></h2>
                            </div>
                        </div>
                        <ViewToggle mode={viewMode} setMode={setViewMode} />
                    </div>
                    <div style={dividerStyle} />
                </motion.div>
                <AnimatePresence mode="wait">
                    {viewMode === "grid" ? (
                        <motion.div className="work-grid" key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                            {orderedProjects.map((project, index) => <WorkGridCard key={project.src} project={project} index={index} kind={id} onSelect={selectProject} />)}
                        </motion.div>
                    ) : (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {orderedProjects.map((project, index) => <WorkListRow key={project.src} project={project} index={index} kind={id} onSelect={selectProject} />)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </>
    );
}
