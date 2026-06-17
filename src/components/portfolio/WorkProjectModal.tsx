import { useEffect } from "react";
import { motion } from "framer-motion";
import type { PortfolioAsset } from "../../data/portfolioAssets";
import WorkMedia, { type WorkKind } from "./WorkMedia";
import { pauseActiveVideo } from "./mediaPlayback";

interface WorkProjectModalProps {
    project: PortfolioAsset;
    kind: WorkKind;
    onClose: () => void;
    reduceMotion?: boolean;
}

const backdropStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9000,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
} as const;

const cardStyle = {
    borderRadius: 28,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(48px) saturate(1.6)",
    WebkitBackdropFilter: "blur(48px) saturate(1.6)",
    border: "1px solid rgba(255,255,255,0.13)",
    boxShadow: "0 40px 120px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.2)",
    position: "relative",
    contain: "layout paint",
} as const;

const topLineStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.38) 45%, rgba(255,255,255,0.38) 55%, transparent 100%)",
    pointerEvents: "none",
    zIndex: 3,
} as const;

const headerStyle = {
    padding: "22px 26px 0",
    display: "flex",
    alignItems: "center",
    gap: 10,
    position: "relative",
    zIndex: 2,
    flexShrink: 0,
} as const;

const backButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 9,
    padding: "6px 13px 6px 9px",
    cursor: "pointer",
    color: "rgba(255,255,255,0.7)",
    fontFamily: "'Syne', sans-serif",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    transition: "transform 0.2s ease, background 0.2s ease, color 0.2s ease",
} as const;

const chipStyle = {
    fontFamily: "'Syne', sans-serif",
    fontSize: "9px",
    fontWeight: 600,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    padding: "4px 11px",
    borderRadius: 6,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.13)",
    color: "rgba(255,255,255,0.6)",
} as const;

export default function WorkProjectModal({ project, kind, onClose, reduceMotion = false }: WorkProjectModalProps) {
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => () => pauseActiveVideo(), []);

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.22 }}
            onClick={onClose}
            style={backdropStyle}
        >
            <motion.div
                className="work-modal-card"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.34, ease: [0.16, 1, 0.3, 1] }}
                onClick={(event) => event.stopPropagation()}
                style={cardStyle}
            >
                <div style={topLineStyle} />
                <div style={headerStyle}>
                    <button onClick={onClose} style={backButtonStyle}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        Back
                    </button>
                    <span style={chipStyle}>{project.tag}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)", marginLeft: "auto" }}>{project.year}</span>
                </div>
                <div className="work-modal-body">
                    <div className="work-modal-media">
                        <WorkMedia project={project} kind={kind} mode="modal" reduceMotion={reduceMotion} />
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
