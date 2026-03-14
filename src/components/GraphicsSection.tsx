import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GraphicProject {
    id: number;
    name: string;
    year: string;
    tag: string;
    tagline: string;
    description: string;
    imageBg: string;
    imageAccent: string;
    shape: "poster" | "square" | "wide";
}

const GRAPHICS: GraphicProject[] = [
    {
        id: 1,
        name: "Solaris Rebrand",
        year: "2024",
        tag: "Identity",
        tagline: "Full visual identity · Energy startup",
        description: "A complete visual identity system for a renewable energy startup. The brand language draws from solar geometry — radiating forms, warm amber tones, and structured grids that communicate both power and precision. Delivered across digital, print, and environmental applications.",
        imageBg: "linear-gradient(145deg, #1a0a00 0%, #5c2700 45%, #f97316 100%)",
        imageAccent: "#fb923c",
        shape: "poster",
    },
    {
        id: 2,
        name: "Nocturne Posters",
        year: "2024",
        tag: "Print",
        tagline: "6-piece typographic event series",
        description: "A six-piece limited edition poster series for a nocturnal music event run. Each piece treats typography as the primary visual medium — letterforms stretched, layered, and broken against deep violet fields. Printed in two-color risograph with spot UV on uncoated stock.",
        imageBg: "linear-gradient(145deg, #0a0014 0%, #2d0057 45%, #9333ea 100%)",
        imageAccent: "#c084fc",
        shape: "square",
    },
    {
        id: 3,
        name: "Helix UI Kit",
        year: "2023",
        tag: "Digital",
        tagline: "200+ production-ready components",
        description: "A production-ready UI component kit with over 200 building blocks covering forms, navigation, data display, feedback states, and layout primitives. Built for Figma with auto-layout throughout, connected variables for theming, and a paired Storybook for engineering handoff.",
        imageBg: "linear-gradient(145deg, #001a2e 0%, #003d6b 45%, #0284c7 100%)",
        imageAccent: "#38bdf8",
        shape: "wide",
    },
    {
        id: 4,
        name: "Phantom Zine",
        year: "2023",
        tag: "Print",
        tagline: "Editorial · Independent culture pub",
        description: "Art direction and layout for a bi-annual independent culture publication. The design system deliberately breaks conventional editorial grids — columns collide, images bleed, and hierarchy is established through scale rather than position. 48 pages, newsprint, perfect bound.",
        imageBg: "linear-gradient(145deg, #0d1a00 0%, #254d00 45%, #65a30d 100%)",
        imageAccent: "#a3e635",
        shape: "poster",
    },
    {
        id: 5,
        name: "Meridian Brand",
        year: "2023",
        tag: "Identity",
        tagline: "Luxury hospitality brand system",
        description: "A refined brand system for a luxury boutique hotel group. The identity balances old-world hospitality with contemporary restraint — a custom geometric serif wordmark, a palette drawn from natural materials, and a suite of branded assets spanning wayfinding to amenity packaging.",
        imageBg: "linear-gradient(145deg, #1a1200 0%, #4d3600 45%, #d97706 100%)",
        imageAccent: "#fbbf24",
        shape: "square",
    },
    {
        id: 6,
        name: "Vertex Annual",
        year: "2022",
        tag: "Print",
        tagline: "Annual report · Tech company",
        description: "Annual report design for a mid-size technology company. Data visualization and editorial narrative are treated as equal partners — charts are designed with the same care as spreads, and the overall arc of the document tells a coherent story about the company's year.",
        imageBg: "linear-gradient(145deg, #00161a 0%, #004d5c 45%, #0891b2 100%)",
        imageAccent: "#22d3ee",
        shape: "wide",
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

// ─── Abstract Art ──────────────────────────────────────────────────────────────
function AbstractArt({ shape }: { shape: GraphicProject["shape"] }) {
    const a = "rgba(255,255,255,0.72)";
    if (shape === "poster") return (
        <svg width="100%" height="100%" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
            <rect x="60" y="30" width="80" height="120" rx="4" fill="none" stroke={a} strokeWidth="0.8" opacity="0.3" />
            <rect x="72" y="44" width="56" height="6" rx="2" fill={a} opacity="0.4" />
            <rect x="72" y="56" width="40" height="3" rx="1.5" fill={a} opacity="0.24" />
            <rect x="72" y="63" width="48" height="3" rx="1.5" fill={a} opacity="0.24" />
            <circle cx="100" cy="110" r="24" fill="none" stroke={a} strokeWidth="0.8" opacity="0.33" />
            <circle cx="100" cy="110" r="14" fill={a} opacity="0.07" />
        </svg>
    );
    if (shape === "square") return (
        <svg width="100%" height="100%" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
            <polygon points="100,20 170,140 30,140" fill="none" stroke={a} strokeWidth="0.8" opacity="0.3" />
            <polygon points="100,45 148,130 52,130" fill={a} opacity="0.06" />
            <line x1="60" y1="80" x2="140" y2="80" stroke={a} strokeWidth="0.6" opacity="0.2" />
            <circle cx="100" cy="85" r="6" fill={a} opacity="0.44" />
        </svg>
    );
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
            {[0, 1, 2, 3, 4].map((i) => (
                <rect key={i} x={30 + i * 28} y={40} width={18} height={60 - i * 6} rx="3" fill={a} opacity={0.1 + i * 0.05} />
            ))}
            <line x1="30" y1="100" x2="170" y2="100" stroke={a} strokeWidth="0.6" opacity="0.22" />
        </svg>
    );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }: { project: GraphicProject; onClose: () => void }) {
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
            style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.91, y: 28 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 720, height: 720, borderRadius: 28, overflow: "hidden", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(48px) saturate(1.6)", WebkitBackdropFilter: "blur(48px) saturate(1.6)", border: "1px solid rgba(255,255,255,0.13)", boxShadow: "0 40px 120px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.2)", position: "relative" }}
            >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.38) 45%, rgba(255,255,255,0.38) 55%, transparent 100%)", pointerEvents: "none", zIndex: 3 }} />

                {/* Header */}
                <div style={{ padding: "22px 26px 0", display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2, flexShrink: 0 }}>
                    <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 9, padding: "6px 13px 6px 9px", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontFamily: "'Syne', sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", transition: "all 0.2s ease" }}
                            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.13)"; b.style.color = "#fff"; }}
                            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.07)"; b.style.color = "rgba(255,255,255,0.7)"; }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        Back
                    </button>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 11px", borderRadius: 6, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.6)" }}>{project.tag}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)", marginLeft: "auto" }}>{project.year}</span>
                </div>

                {/* Body */}
                <div style={{ flex: 1, display: "flex", gap: 0, padding: "24px 26px 26px", minHeight: 0 }}>
                    {/* Left — abstract art panel */}
                    <div style={{ width: 296, flexShrink: 0, borderRadius: 18, background: project.imageBg, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <AbstractArt shape={project.shape} />
                        {/* Grain overlay */}
                        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: "none", opacity: 0.5 }} />
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)" }} />
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
function GraphicGridCard({ project, index, onClick }: { project: GraphicProject; index: number; onClick: () => void }) {
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
            <div style={{ height: 190, background: project.imageBg, position: "relative", overflow: "hidden" }}>
                <AbstractArt shape={project.shape} />
                <div style={{ position: "absolute", top: 14, right: 14, fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 6, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)" }}>{project.tag}</div>
                <motion.div animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.25 }} style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)", pointerEvents: "none" }} />
            </div>
            <div style={{ padding: "18px 20px 20px" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px, 1.6vw, 19px)", fontWeight: 400, letterSpacing: "-0.015em", color: "rgba(255,255,255,0.97)", marginBottom: 6, lineHeight: 1.2 }}>{project.name}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(11px, 1.1vw, 13px)", fontWeight: 300, color: "rgba(255,255,255,0.44)", marginBottom: 14, lineHeight: 1.5 }}>{project.tagline}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.27)" }}>{project.year}</span>
                    <motion.div animate={{ x: hovered ? 3 : 0, opacity: hovered ? 1 : 0.38 }} transition={{ duration: 0.2 }} style={{ color: "rgba(255,255,255,0.9)" }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── List Row ──────────────────────────────────────────────────────────────────
function GraphicListRow({ project, index, onClick }: { project: GraphicProject; index: number; onClick: () => void }) {
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
            {/* Swatch with abstract art preview */}
            <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: project.imageBg, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", position: "relative" }}>
                <AbstractArt shape={project.shape} />
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
export default function GraphicsSection() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selected, setSelected] = useState<GraphicProject | null>(null);

    useEffect(() => {
        document.body.style.overflow = selected ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [selected]);

    const close = useCallback(() => setSelected(null), []);

    return (
        <>
            <AnimatePresence>{selected && <ProjectModal project={selected} onClose={close} />}</AnimatePresence>

            <section id="graphics" style={{ padding: "100px 0 80px" }}>
                <div style={{ height: "1px", marginBottom: 100, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ marginBottom: 52 }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", marginBottom: 4 }}>Graphics</p>
                                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 3.2vw, 48px)", fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.08, color: "#fff" }}>
                                    Visual Identity &{" "}<em style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>Print</em>
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
                            {GRAPHICS.map((p, i) => <GraphicGridCard key={p.id} project={p} index={i} onClick={() => setSelected(p)} />)}
                        </motion.div>
                    ) : (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {GRAPHICS.map((p, i) => <GraphicListRow key={p.id} project={p} index={i} onClick={() => setSelected(p)} />)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </>
    );
}