import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WebsiteProject {
    id: number;
    name: string;
    year: string;
    tag: string;
    tagline: string;
    description: string;
    imageBg: string;
    imageAccent: string;
}

const WEBSITES: WebsiteProject[] = [
    {
        id: 1,
        name: "Aurion Studio",
        year: "2024",
        tag: "Live",
        tagline: "Creative agency · Immersive 3D scroll",
        description: "A full-screen experiential website for a creative agency built around immersive WebGL scroll sequences. Each section transitions through a custom three.js environment, using depth-of-field, particle systems, and spatial audio cues to pull visitors into the brand world.",
        imageBg: "linear-gradient(135deg, #1a0a3a 0%, #3d1f6e 50%, #6d28d9 100%)",
        imageAccent: "#7c6fff",
    },
    {
        id: 2,
        name: "Vessel CMS",
        year: "2024",
        tag: "Shipped",
        tagline: "Headless CMS · 40k+ creators",
        description: "The marketing site and onboarding flow for a headless CMS platform serving over 40,000 creators. Designed with clarity as the north star — a dense feature set translated into a scannable, conversion-optimized surface with interactive demos embedded inline.",
        imageBg: "linear-gradient(135deg, #0a1628 0%, #0e2a52 50%, #1e4dd8 100%)",
        imageAccent: "#60a5fa",
    },
    {
        id: 3,
        name: "Delphi Finance",
        year: "2023",
        tag: "Live",
        tagline: "DeFi dashboard · Real-time analytics",
        description: "A real-time DeFi analytics dashboard built for power users. Data-dense but intentionally legible — live chart feeds, position summaries, and protocol risk scores all coexist without visual noise. Designed in Figma and shipped in React with WebSocket-backed live state.",
        imageBg: "linear-gradient(135deg, #001a12 0%, #064e3b 50%, #10b981 100%)",
        imageAccent: "#34d399",
    },
    {
        id: 4,
        name: "Nomad Spaces",
        year: "2023",
        tag: "Shipped",
        tagline: "Spatial booking · Remote work",
        description: "A spatial booking experience for remote workers seeking short-stay workspaces. The interface treats location search as a map-first experience — browsing feels like exploring rather than filtering. Animated transitions between discovery, detail, and checkout states.",
        imageBg: "linear-gradient(135deg, #1a0a0a 0%, #4c1d1d 50%, #dc2626 100%)",
        imageAccent: "#f87171",
    },
    {
        id: 5,
        name: "Lumis Health",
        year: "2023",
        tag: "Live",
        tagline: "Digital health · Patient portal",
        description: "A patient-facing portal for a digital health platform focused on chronic condition management. Accessibility was a first-class constraint throughout — WCAG AA at minimum, tested with screen readers, and built to feel calm and trustworthy under medical stress.",
        imageBg: "linear-gradient(135deg, #0a1a1a 0%, #164e63 50%, #0891b2 100%)",
        imageAccent: "#22d3ee",
    },
    {
        id: 6,
        name: "Prism Events",
        year: "2022",
        tag: "Shipped",
        tagline: "Event platform · Ticketing & scheduling",
        description: "End-to-end design for an event discovery and ticketing platform. From the browse experience to the checkout flow to the digital ticket wallet — each touchpoint designed as part of a cohesive system. Shipped with a custom design system used by the internal product team.",
        imageBg: "linear-gradient(135deg, #1a0a14 0%, #500724 50%, #db2777 100%)",
        imageAccent: "#f472b6",
    },
];

// ─── Shared glass ──────────────────────────────────────────────────────────────
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

// ─── Browser Chrome Preview ───────────────────────────────────────────────────
function BrowserPreview({ imageBg, imageAccent, large = false }: { imageBg: string; imageAccent: string; large?: boolean }) {
    const h = large ? "100%" : 60;
    return (
        <div style={{
            width: "100%", height: h,
            background: imageBg, position: "relative", overflow: "hidden",
            display: "flex", flexDirection: "column",
        }}>
            {/* Chrome bar */}
            <div style={{
                height: large ? 34 : 20, flexShrink: 0,
                background: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", padding: `0 ${large ? 14 : 8}px`, gap: large ? 6 : 4,
            }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                    <div key={c} style={{ width: large ? 9 : 5, height: large ? 9 : 5, borderRadius: "50%", background: c, opacity: 0.85 }} />
                ))}
                <div style={{ flex: 1, height: large ? 18 : 10, borderRadius: 4, background: "rgba(255,255,255,0.08)", marginLeft: large ? 8 : 5 }} />
            </div>

            {/* Page content placeholder */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                    width: large ? 88 : 32, height: large ? 88 : 32, borderRadius: "50%",
                    background: `radial-gradient(circle, ${imageAccent}44 0%, ${imageAccent}11 70%)`,
                    border: `1px solid ${imageAccent}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width={large ? 36 : 14} height={large ? 36 : 14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 21V9" />
                    </svg>
                </div>
            </div>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)" }} />
        </div>
    );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }: { project: WebsiteProject; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 9000,
                background: "rgba(0,0,0,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.91, y: 28 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 720, height: 720, borderRadius: 28, overflow: "hidden",
                    display: "flex", flexDirection: "column",
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(48px) saturate(1.6)",
                    WebkitBackdropFilter: "blur(48px) saturate(1.6)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    boxShadow: "0 40px 120px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.2)",
                    position: "relative",
                }}
            >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.38) 45%, rgba(255,255,255,0.38) 55%, transparent 100%)", pointerEvents: "none", zIndex: 3 }} />

                {/* Header */}
                <div style={{ padding: "22px 26px 0", display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2, flexShrink: 0 }}>
                    <button onClick={onClose} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 9, padding: "6px 13px 6px 9px", cursor: "pointer",
                        color: "rgba(255,255,255,0.7)", fontFamily: "'Syne', sans-serif",
                        fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase",
                        transition: "all 0.2s ease",
                    }}
                            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.13)"; b.style.color = "#fff"; }}
                            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.07)"; b.style.color = "rgba(255,255,255,0.7)"; }}
                    >
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        Back
                    </button>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 11px", borderRadius: 6, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.6)" }}>{project.tag}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)", marginLeft: "auto" }}>{project.year}</span>
                </div>

                {/* Body */}
                <div style={{ flex: 1, display: "flex", gap: 0, padding: "24px 26px 26px", minHeight: 0 }}>
                    {/* Left — browser preview */}
                    <div style={{
                        width: 296, flexShrink: 0, borderRadius: 18,
                        background: project.imageBg, border: "1px solid rgba(255,255,255,0.1)",
                        overflow: "hidden", position: "relative",
                        display: "flex", flexDirection: "column",
                    }}>
                        <BrowserPreview imageBg={project.imageBg} imageAccent={project.imageAccent} large />
                    </div>

                    {/* Right */}
                    <div style={{ flex: 1, paddingLeft: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
                        <div>
                            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 10 }}>Project</p>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.1, color: "#fff", marginBottom: 6 }}>{project.name}</h3>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.5)", marginBottom: 22, lineHeight: 1.5 }}>{project.tagline}</p>
                            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 22 }} />
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(13px, 1.25vw, 15px)", fontWeight: 300, lineHeight: 1.85, color: "rgba(255,255,255,0.7)" }}>{project.description}</p>
                        </div>
                        <div style={{ display: "flex", gap: 11, marginTop: 28, flexShrink: 0 }}>
                            <button style={{ flex: 1, padding: "12px 18px", borderRadius: 12, cursor: "pointer", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.92)", fontFamily: "'Syne', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.22s ease", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 16px rgba(0,0,0,0.2)" }}
                                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.17)"; b.style.borderColor = "rgba(255,255,255,0.35)"; }}
                                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.1)"; b.style.borderColor = "rgba(255,255,255,0.22)"; }}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>
                                Live Demo
                            </button>
                            <button style={{ flex: 1, padding: "12px 18px", borderRadius: 12, cursor: "pointer", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.11)", color: "rgba(255,255,255,0.6)", fontFamily: "'Syne', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.22s ease", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09)" }}
                                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.1)"; b.style.borderColor = "rgba(255,255,255,0.2)"; b.style.color = "rgba(255,255,255,0.9)"; }}
                                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.05)"; b.style.borderColor = "rgba(255,255,255,0.11)"; b.style.color = "rgba(255,255,255,0.6)"; }}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                                GitHub
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Toggle ────────────────────────────────────────────────────────────────────
function ViewToggle({ mode, setMode }: { mode: "grid" | "list"; setMode: (m: "grid" | "list") => void }) {
    return (
        <div style={{ display: "flex", gap: 4, padding: "4px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {(["grid", "list"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 26, borderRadius: 7, border: "none", cursor: "pointer", background: mode === m ? "rgba(255,255,255,0.14)" : "transparent", color: mode === m ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.38)", transition: "all 0.2s ease" }}>
                    {m === "grid" ? (
                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
                            <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
                        </svg>
                    ) : (
                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="5" rx="1.5" /><rect x="3" y="10" width="18" height="5" rx="1.5" /><rect x="3" y="17" width="18" height="5" rx="1.5" />
                        </svg>
                    )}
                </button>
            ))}
        </div>
    );
}

// ─── Grid Card ─────────────────────────────────────────────────────────────────
function WebsiteGridCard({ project, index, onClick }: { project: WebsiteProject; index: number; onClick: () => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            onClick={onClick}
            style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer", transform: hovered ? "translateY(-4px)" : "translateY(0)", ...glassBase(hovered) }}
        >
            <div style={{ height: 200, background: project.imageBg, position: "relative", overflow: "hidden" }}>
                {/* Browser chrome */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 32, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", padding: "0 14px", gap: 6 }}>
                    {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.85 }} />)}
                    <div style={{ flex: 1, height: 18, borderRadius: 5, background: "rgba(255,255,255,0.08)", marginLeft: 8 }} />
                </div>
                <div style={{ position: "absolute", inset: 0, top: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${project.imageAccent}44 0%, ${project.imageAccent}11 70%)`, border: `1px solid ${project.imageAccent}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 21V9" /></svg>
                    </div>
                </div>
                <motion.div animate={{ x: hovered ? "100%" : "-100%" }} transition={{ duration: 0.55, ease: "easeInOut" }} style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)", pointerEvents: "none" }} />
            </div>
            <div style={{ padding: "20px 22px 22px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px, 1.6vw, 20px)", fontWeight: 400, letterSpacing: "-0.015em", color: "rgba(255,255,255,0.97)", lineHeight: 1.2 }}>{project.name}</p>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 5, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap", marginLeft: 8, marginTop: 2 }}>{project.tag}</span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(12px, 1.2vw, 13px)", fontWeight: 300, color: "rgba(255,255,255,0.44)", marginBottom: 14, lineHeight: 1.5 }}>{project.tagline}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.27)" }}>{project.year}</span>
                    <motion.div animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.38 }} transition={{ duration: 0.2 }} style={{ color: "rgba(255,255,255,0.9)" }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── List Row ──────────────────────────────────────────────────────────────────
function WebsiteListRow({ project, index, onClick }: { project: WebsiteProject; index: number; onClick: () => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            onClick={onClick}
            style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 20px", borderRadius: 14, cursor: "pointer", ...glassBase(hovered) }}
        >
            {/* Mini browser swatch */}
            <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: project.imageBg, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 14, background: "rgba(0,0,0,0.38)", display: "flex", alignItems: "center", padding: "0 5px", gap: 3 }}>
                    {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 4, height: 4, borderRadius: "50%", background: c, opacity: 0.8 }} />)}
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 21V9" /></svg>
                </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.97)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,0.44)", lineHeight: 1.4 }}>{project.tagline}</p>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 5, flexShrink: 0, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.65)" }}>{project.tag}</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.27)", flexShrink: 0 }}>{project.year}</span>
            <motion.div animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.32 }} transition={{ duration: 0.2 }} style={{ color: "rgba(255,255,255,0.88)", flexShrink: 0 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </motion.div>
        </motion.div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function WebsitesSection() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selected, setSelected] = useState<WebsiteProject | null>(null);

    useEffect(() => {
        document.body.style.overflow = selected ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [selected]);

    const close = useCallback(() => setSelected(null), []);

    return (
        <>
            <AnimatePresence>{selected && <ProjectModal project={selected} onClose={close} />}</AnimatePresence>

            <section id="websites" style={{ padding: "100px 0 80px" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ marginBottom: 52 }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 21V9" /></svg>
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", marginBottom: 4 }}>Websites</p>
                                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 3.2vw, 48px)", fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.08, color: "#fff" }}>
                                    Web Design &{" "}<em style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>Development</em>
                                </h2>
                            </div>
                        </div>
                        <ViewToggle mode={viewMode} setMode={setViewMode} />
                    </div>
                    <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)" }} />
                </motion.div>

                <AnimatePresence mode="wait">
                    {viewMode === "grid" ? (
                        <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                            {WEBSITES.map((p, i) => <WebsiteGridCard key={p.id} project={p} index={i} onClick={() => setSelected(p)} />)}
                        </motion.div>
                    ) : (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {WEBSITES.map((p, i) => <WebsiteListRow key={p.id} project={p} index={i} onClick={() => setSelected(p)} />)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </>
    );
}