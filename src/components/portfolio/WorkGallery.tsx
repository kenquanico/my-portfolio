import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type Transition, useReducedMotion } from "framer-motion";
import type { PortfolioAsset } from "../../data/portfolioAssets";
import WorkMedia, { type WorkKind } from "./WorkMedia";
import { pauseActiveVideo } from "./mediaPlayback";

const WorkProjectModal = lazy(() => import("./WorkProjectModal"));

type ViewMode = "grid" | "list";

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
    reduceMotion: boolean;
    onSelect: (project: PortfolioAsset) => void;
}

const sharedCss = `
  .work-optimized-section {
    content-visibility: auto;
    contain-intrinsic-size: 900px;
    contain: layout paint style;
  }
  .work-section-header { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 18px; }
  .work-section-title { display: flex; align-items: center; gap: 20px; min-width: 0; }
  .work-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
  .work-card { will-change: transform, opacity; contain: layout paint; }
  .work-card-media { position: relative; overflow: hidden; background: rgba(255,255,255,0.04); }
  .work-modal-card { width: min(780px, calc(100vw - 32px)); max-height: min(760px, calc(100vh - 32px)); }
  .work-modal-body { display: grid; grid-template-columns: minmax(250px, 330px) minmax(0, 1fr); gap: 30px; padding: 24px 26px 26px; min-height: 0; }
  .work-modal-copy { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
  .work-modal-media { width: 100%; align-self: center; }
  .media-shell { position: relative; overflow: hidden; width: 100%; background: rgba(255,255,255,0.04); contain: layout paint; }
  .media-shell-thumb { height: auto; }
  .media-shell-swatch { width: 56px; height: 56px; }
  .media-shell-modal { max-height: min(62vh, 560px); }
  .media-orientation-portrait.media-shell-modal { max-width: min(280px, 100%); margin: 0 auto; border-radius: 24px; }
  .media-orientation-landscape.media-shell-modal { max-width: 100%; border-radius: 18px; }
  .media-orientation-square.media-shell-modal { max-width: min(430px, 100%); margin: 0 auto; border-radius: 18px; }
  .media-skeleton { position: absolute; inset: 0; background: linear-gradient(110deg, rgba(255,255,255,0.04), rgba(255,255,255,0.11), rgba(255,255,255,0.04)); background-size: 220% 100%; animation: media-shimmer 1.25s ease-in-out infinite; }
  .media-play-button {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.35);
    background: rgba(0,0,0,0.56);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.22);
    transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;
    will-change: transform;
  }
  .media-play-button:hover { transform: translate3d(-50%, -50%, 0) scale(1.06); background: rgba(0,0,0,0.66); }
  .media-shell-swatch .media-play-button { width: 34px; height: 34px; }
  .media-top-line { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent); pointer-events: none; }
  @keyframes media-shimmer { from { background-position: 120% 0; } to { background-position: -120% 0; } }
  @media (prefers-reduced-motion: reduce) {
    .media-skeleton { animation: none; }
    .media-play-button, .work-card { transition: none !important; }
  }
  @media (max-width: 760px) {
    .work-section-header { align-items: flex-start; flex-direction: column; }
    .work-modal-card { overflow-y: auto; backdrop-filter: blur(24px) saturate(1.25) !important; -webkit-backdrop-filter: blur(24px) saturate(1.25) !important; box-shadow: 0 24px 72px rgba(0,0,0,0.68), inset 0 1px 0 rgba(255,255,255,0.16) !important; }
    .work-modal-body { grid-template-columns: 1fr; gap: 22px; }
    .work-modal-copy { padding-left: 0; }
    .media-shell-modal { max-height: min(54vh, 430px); }
    .media-play-button { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 8px 22px rgba(0,0,0,0.34); }
  }
  @media (max-width: 560px) {
    .work-section-title { align-items: flex-start; }
    .work-list-row { align-items: flex-start !important; flex-wrap: wrap; gap: 12px !important; }
    .work-list-meta { margin-left: 68px; }
  }
`;

const sectionStyle = { padding: "100px 0 80px" };
const logosSectionStyle = { padding: "100px 0 120px" };
const gridContainerStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 };
const listContainerStyle = { display: "flex", flexDirection: "column", gap: 10 } as const;
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
    transition: "transform 0.38s cubic-bezier(0.16,1,0.3,1), border-color 0.38s cubic-bezier(0.16,1,0.3,1)",
});

function cardTransition(index: number, reduceMotion: boolean): Transition {
    return {
        duration: reduceMotion ? 0.01 : 0.5,
        delay: reduceMotion ? 0 : index * 0.04,
        ease: [0.16, 1, 0.3, 1] as const,
    };
}

const ModalFallback = memo(function ModalFallback() {
    return <div style={{ position: "fixed", inset: 0, zIndex: 8999, background: "rgba(0,0,0,0.35)" }} />;
});

function ViewToggle({ mode, setMode }: { mode: ViewMode; setMode: (mode: ViewMode) => void }) {
    const setGrid = useCallback(() => setMode("grid"), [setMode]);
    const setList = useCallback(() => setMode("list"), [setMode]);

    return (
        <div style={{ display: "flex", gap: 4, padding: "4px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <button onClick={setGrid} title="grid view" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 26, borderRadius: 7, border: "none", cursor: "pointer", background: mode === "grid" ? "rgba(255,255,255,0.14)" : "transparent", color: mode === "grid" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.38)", transition: "transform 0.2s ease, background 0.2s ease" }}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
            </button>
            <button onClick={setList} title="list view" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 26, borderRadius: 7, border: "none", cursor: "pointer", background: mode === "list" ? "rgba(255,255,255,0.14)" : "transparent", color: mode === "list" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.38)", transition: "transform 0.2s ease, background 0.2s ease" }}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="1.5" /><rect x="3" y="10" width="18" height="5" rx="1.5" /><rect x="3" y="17" width="18" height="5" rx="1.5" /></svg>
            </button>
        </div>
    );
}

const WorkGridCard = memo(function WorkGridCard({ project, index, kind, reduceMotion, onSelect }: WorkCardProps) {
    const [hovered, setHovered] = useState(false);
    const handleClick = useCallback(() => onSelect(project), [onSelect, project]);
    const handleEnter = useCallback(() => setHovered(true), []);
    const handleLeave = useCallback(() => setHovered(false), []);
    const badge = kind === "websites" ? project.kind : project.extension;
    const transition = useMemo(() => cardTransition(index, reduceMotion), [index, reduceMotion]);

    return (
        <motion.div className="work-card" initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={transition} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onClick={handleClick} style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer", transform: hovered ? "translate3d(0,-4px,0)" : "translate3d(0,0,0)", ...glassBase(hovered) }}>
            <div className="work-card-media" style={{ padding: kind === "logos" ? 18 : 0 }}>
                <WorkMedia project={project} kind={kind} mode="thumb" fit={kind === "logos" ? "contain" : "cover"} reduceMotion={reduceMotion} />
                <div style={{ position: "absolute", top: 14, right: 14, fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 6, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)" }}>{badge}</div>
                <motion.div animate={{ opacity: hovered && !reduceMotion ? 1 : 0 }} transition={{ duration: 0.22 }} style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.36) 0%, transparent 60%)", pointerEvents: "none" }} />
            </div>
            <div style={{ padding: kind === "websites" ? "20px 22px 22px" : "18px 20px 20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px, 1.6vw, 20px)", fontWeight: 400, letterSpacing: "-0.015em", color: "rgba(255,255,255,0.97)", lineHeight: 1.2 }}>{project.name}</p>
                    {kind === "websites" && <span style={tagStyle}>{project.tag}</span>}
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(12px, 1.2vw, 13px)", fontWeight: 300, color: "rgba(255,255,255,0.44)", marginBottom: 14, lineHeight: 1.5 }}>{project.tagline}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.27)" }}>{project.year}</span>
                    <motion.div animate={{ x: hovered && !reduceMotion ? 4 : 0, opacity: hovered ? 1 : 0.38 }} transition={{ duration: 0.2 }} style={{ color: "rgba(255,255,255,0.9)", willChange: "transform, opacity" }}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></motion.div>
                </div>
            </div>
        </motion.div>
    );
});

const WorkListRow = memo(function WorkListRow({ project, index, kind, reduceMotion, onSelect }: WorkCardProps) {
    const [hovered, setHovered] = useState(false);
    const handleClick = useCallback(() => onSelect(project), [onSelect, project]);
    const handleEnter = useCallback(() => setHovered(true), []);
    const handleLeave = useCallback(() => setHovered(false), []);
    const transition = useMemo(() => cardTransition(index, reduceMotion), [index, reduceMotion]);

    return (
        <motion.div className="work-list-row work-card" initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={transition} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onClick={handleClick} style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 20px", borderRadius: 14, cursor: "pointer", ...glassBase(hovered) }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", background: kind === "logos" ? "#fff" : "rgba(255,255,255,0.04)" }}>
                <WorkMedia project={project} kind={kind} mode="swatch" fit={kind === "logos" ? "contain" : "cover"} reduceMotion={reduceMotion} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.97)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,0.44)", lineHeight: 1.4 }}>{project.fileName}</p>
            </div>
            <div className="work-list-meta" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 5, flexShrink: 0, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.65)" }}>{project.tag}</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.27)", flexShrink: 0 }}>{project.year}</span>
                <motion.div animate={{ x: hovered && !reduceMotion ? 4 : 0, opacity: hovered ? 1 : 0.32 }} transition={{ duration: 0.2 }} style={{ color: "rgba(255,255,255,0.88)", flexShrink: 0, willChange: "transform, opacity" }}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></motion.div>
            </div>
        </motion.div>
    );
});

export default function WorkGallery({ id, eyebrow, title, emphasizedTitle, icon, projects }: WorkGalleryProps) {
    const prefersReducedMotion = useReducedMotion();
    const reduceMotion = Boolean(prefersReducedMotion);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selected, setSelected] = useState<PortfolioAsset | null>(null);
    const orderedProjects = useMemo(() => projects, [projects]);
    const selectProject = useCallback((project: PortfolioAsset) => setSelected(project), []);
    const close = useCallback(() => setSelected(null), []);

    useEffect(() => {
        document.body.style.overflow = selected ? "hidden" : "";
        if (!selected) pauseActiveVideo();
        return () => {
            document.body.style.overflow = "";
            pauseActiveVideo();
        };
    }, [selected]);

    return (
        <>
            <style>{sharedCss}</style>
            <AnimatePresence>
                {selected && (
                    <Suspense fallback={<ModalFallback />}>
                        <WorkProjectModal project={selected} kind={id} onClose={close} reduceMotion={reduceMotion} />
                    </Suspense>
                )}
            </AnimatePresence>
            <section id={id} className="work-optimized-section" style={id === "logos" ? logosSectionStyle : sectionStyle}>
                {id !== "websites" && <div style={upperDividerStyle} />}
                <motion.div initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: reduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 52, willChange: reduceMotion ? undefined : "transform, opacity" }}>
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
                        <motion.div className="work-grid" key="grid" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.01 : 0.2 }} style={gridContainerStyle}>
                            {orderedProjects.map((project, index) => <WorkGridCard key={project.src} project={project} index={index} kind={id} onSelect={selectProject} reduceMotion={reduceMotion} />)}
                        </motion.div>
                    ) : (
                        <motion.div key="list" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.01 : 0.2 }} style={listContainerStyle}>
                            {orderedProjects.map((project, index) => <WorkListRow key={project.src} project={project} index={index} kind={id} onSelect={selectProject} reduceMotion={reduceMotion} />)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </>
    );
}
