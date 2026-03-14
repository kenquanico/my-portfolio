import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LogoProject {
    id: number;
    name: string;
    year: string;
    tag: string;
    tagline: string;
    description: string;
    imageBg: string;
    imageAccent: string;
    svgPreview: string;
}

const LOGOS: LogoProject[] = [
    {
        id: 1,
        name: "Arklight Mark",
        year: "2024",
        tag: "Mark",
        tagline: "Architectural lighting studio",
        description: "A geometric logomark designed for an architectural lighting studio. The hexagonal form references both structural precision and the play of light through faceted surfaces. Delivered as a full brand system including dark and light variants, icon set, and brand guidelines.",
        imageBg: "linear-gradient(145deg, #0a0f1a 0%, #0f2040 50%, #1a3a6b 100%)",
        imageAccent: "#93c5fd",
        svgPreview: "M12 3L3 8v8l9 5 9-5V8L12 3z M12 3v13 M3 8l9 5 M21 8l-9 5",
    },
    {
        id: 2,
        name: "Fern & Root",
        year: "2024",
        tag: "Wordmark",
        tagline: "Botanical wellness brand",
        description: "A hand-crafted wordmark for a botanical wellness brand rooted in slow living. The letterforms carry organic tension — slightly uneven, slightly alive. Paired with a secondary mark using a fern motif, the identity spans packaging, digital, and print with a consistent earthy warmth.",
        imageBg: "linear-gradient(145deg, #020f06 0%, #05260f 50%, #166534 100%)",
        imageAccent: "#86efac",
        svgPreview: "M12 22V12 M12 12C12 12 7 10 7 5a5 5 0 0110 0c0 5-5 7-5 7z M12 12C12 12 17 10 17 5",
    },
    {
        id: 3,
        name: "Vero Type",
        year: "2023",
        tag: "Lettering",
        tagline: "Swiss-inspired type foundry",
        description: "Custom lettering for an independent type foundry drawing from Swiss modernism. The logotype is constructed entirely from geometric primitives — circles, lines, and right angles — reflecting the foundry's commitment to rational, grid-based type design.",
        imageBg: "linear-gradient(145deg, #1a1400 0%, #3d2f00 50%, #78600a 100%)",
        imageAccent: "#fde68a",
        svgPreview: "M4 7h16 M12 7v13 M9 17h6",
    },
    {
        id: 4,
        name: "Pulse Health",
        year: "2023",
        tag: "Mark",
        tagline: "Digital health platform",
        description: "A dynamic mark for a digital health platform built around real-time patient monitoring. The waveform icon abstracts a heartbeat into a clean, scalable symbol that reads clearly at any size — from app icon to billboard. The full identity uses motion as a core design element.",
        imageBg: "linear-gradient(145deg, #1a0014 0%, #3d0032 50%, #831843 100%)",
        imageAccent: "#f9a8d4",
        svgPreview: "M2 12h4l3-9 4 18 3-9h6",
    },
    {
        id: 5,
        name: "Crest Studio",
        year: "2022",
        tag: "Mark",
        tagline: "Premium furniture brand",
        description: "A heraldic-inspired mark for a premium furniture studio blending craft tradition with contemporary form. The starburst crest communicates heritage without feeling ornamental or dated. Delivered alongside a refined typographic system in two weights.",
        imageBg: "linear-gradient(145deg, #0a0a0a 0%, #1f1f1f 50%, #404040 100%)",
        imageAccent: "#e5e5e5",
        svgPreview: "M12 3l2.5 5.5L20 9.5l-4 4 1 5.5L12 16.5 7 19l1-5.5-4-4 5.5-.5L12 3z",
    },
    {
        id: 6,
        name: "Nova Ventures",
        year: "2022",
        tag: "Wordmark",
        tagline: "VC firm · Growth-stage focus",
        description: "A sharp, forward-leaning wordmark for a growth-stage venture firm. The triangular arrow embedded in the mark speaks directly to upward momentum and directional conviction. Clean, confident, and built to command presence in pitch decks and digital first impressions.",
        imageBg: "linear-gradient(145deg, #00001a 0%, #000540 50%, #0a0f6b 100%)",
        imageAccent: "#a5b4fc",
        svgPreview: "M12 2L2 19h20L12 2z M12 8v6 M12 16v2",
    },
];

// ─── Shared glass styles ───────────────────────────────────────────────────────
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

// ─── Logo Preview ─────────────────────────────────────────────────────────────
function LogoPreview({ svgPreview, circleSize = 90 }: { svgPreview: string; circleSize?: number }) {
    const iconSize = Math.round(circleSize * 0.44);
    return (
        <div style={{
            width: circleSize, height: circleSize, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", flexShrink: 0,
        }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.07)" }} />
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
                 stroke="rgba(255,255,255,0.92)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={svgPreview} />
            </svg>
        </div>
    );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }: { project: LogoProject; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 9000,
                background: "rgba(0,0,0,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                /* No backdrop-filter here — keeps background fully sharp/unblurred */
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.91, y: 28 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 720, height: 720,
                    borderRadius: 28, overflow: "hidden",
                    display: "flex", flexDirection: "column",
                    /* Pure glass — zero fill, full blur */
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(48px) saturate(1.6)",
                    WebkitBackdropFilter: "blur(48px) saturate(1.6)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    boxShadow: "0 40px 120px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.2)",
                    position: "relative",
                }}
            >
                {/* Top shimmer line */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 1,
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.38) 45%, rgba(255,255,255,0.38) 55%, transparent 100%)",
                    pointerEvents: "none", zIndex: 3,
                }} />

                {/* Header row */}
                <div style={{
                    padding: "22px 26px 0",
                    display: "flex", alignItems: "center", gap: 10,
                    position: "relative", zIndex: 2, flexShrink: 0,
                }}>
                    {/* Back / chevron button */}
                    <button
                        onClick={onClose}
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.14)",
                            borderRadius: 9, padding: "6px 13px 6px 9px",
                            cursor: "pointer",
                            color: "rgba(255,255,255,0.7)",
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "11px", fontWeight: 500,
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={e => {
                            const b = e.currentTarget as HTMLButtonElement;
                            b.style.background = "rgba(255,255,255,0.13)";
                            b.style.color = "#fff";
                        }}
                        onMouseLeave={e => {
                            const b = e.currentTarget as HTMLButtonElement;
                            b.style.background = "rgba(255,255,255,0.07)";
                            b.style.color = "rgba(255,255,255,0.7)";
                        }}
                    >
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Back
                    </button>

                    <span style={{
                        fontFamily: "'Syne', sans-serif", fontSize: "9px",
                        fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
                        padding: "4px 11px", borderRadius: 6,
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.13)",
                        color: "rgba(255,255,255,0.6)",
                    }}>{project.tag}</span>

                    <span style={{
                        fontFamily: "'Syne', sans-serif", fontSize: "10px",
                        letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)",
                        marginLeft: "auto",
                    }}>{project.year}</span>
                </div>

                {/* Body */}
                <div style={{
                    flex: 1, display: "flex", gap: 0,
                    padding: "24px 26px 26px",
                    minHeight: 0,
                }}>
                    {/* Left — image preview panel */}
                    <div style={{
                        width: 296, flexShrink: 0,
                        borderRadius: 18,
                        background: project.imageBg,
                        border: "1px solid rgba(255,255,255,0.1)",
                        overflow: "hidden",
                        position: "relative",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        {/* Dot grid */}
                        <div style={{
                            position: "absolute", inset: 0,
                            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)",
                            backgroundSize: "24px 24px", opacity: 0.45,
                        }} />
                        {/* Crosshairs */}
                        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.16), transparent)" }} />
                        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)" }} />

                        {/* Large logo */}
                        <div style={{ position: "relative", zIndex: 2 }}>
                            <div style={{
                                width: 128, height: 128, borderRadius: "50%",
                                background: "rgba(255,255,255,0.09)",
                                border: "1px solid rgba(255,255,255,0.22)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                position: "relative",
                            }}>
                                <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.07)" }} />
                                <div style={{ position: "absolute", inset: -24, borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.04)" }} />
                                <svg width={56} height={56} viewBox="0 0 24 24" fill="none"
                                     stroke="rgba(255,255,255,0.93)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
                                    <path d={project.svgPreview} />
                                </svg>
                            </div>
                        </div>

                        {/* Panel top edge */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)" }} />
                    </div>

                    {/* Right — description */}
                    <div style={{
                        flex: 1, paddingLeft: 30,
                        display: "flex", flexDirection: "column",
                        justifyContent: "space-between",
                        overflow: "hidden",
                    }}>
                        <div>
                            <p style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "10px",
                                fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase",
                                color: "rgba(255,255,255,0.38)", marginBottom: 10,
                            }}>Project</p>
                            <h3 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(24px, 2.6vw, 34px)",
                                fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.1,
                                color: "#fff", marginBottom: 6,
                            }}>{project.name}</h3>
                            <p style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: 13, fontWeight: 400,
                                color: "rgba(255,255,255,0.5)", marginBottom: 22, lineHeight: 1.5,
                            }}>{project.tagline}</p>

                            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 22 }} />

                            <p style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "clamp(13px, 1.25vw, 15px)",
                                fontWeight: 300, lineHeight: 1.85,
                                color: "rgba(255,255,255,0.7)",
                            }}>{project.description}</p>
                        </div>

                        {/* CTA buttons */}
                        <div style={{ display: "flex", gap: 11, marginTop: 28, flexShrink: 0 }}>
                            {/* Live Demo — brighter glass */}
                            <button style={{
                                flex: 1, padding: "12px 18px",
                                borderRadius: 12, cursor: "pointer",
                                background: "rgba(255,255,255,0.1)",
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                border: "1px solid rgba(255,255,255,0.22)",
                                color: "rgba(255,255,255,0.92)",
                                fontFamily: "'Syne', sans-serif",
                                fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.18em", textTransform: "uppercase",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "all 0.22s ease",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 16px rgba(0,0,0,0.2)",
                            }}
                                    onMouseEnter={e => {
                                        const b = e.currentTarget as HTMLButtonElement;
                                        b.style.background = "rgba(255,255,255,0.17)";
                                        b.style.borderColor = "rgba(255,255,255,0.35)";
                                    }}
                                    onMouseLeave={e => {
                                        const b = e.currentTarget as HTMLButtonElement;
                                        b.style.background = "rgba(255,255,255,0.1)";
                                        b.style.borderColor = "rgba(255,255,255,0.22)";
                                    }}
                            >
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                                </svg>
                                Live Demo
                            </button>

                            {/* GitHub — dimmer glass */}
                            <button style={{
                                flex: 1, padding: "12px 18px",
                                borderRadius: 12, cursor: "pointer",
                                background: "rgba(255,255,255,0.05)",
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                border: "1px solid rgba(255,255,255,0.11)",
                                color: "rgba(255,255,255,0.6)",
                                fontFamily: "'Syne', sans-serif",
                                fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.18em", textTransform: "uppercase",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "all 0.22s ease",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09)",
                            }}
                                    onMouseEnter={e => {
                                        const b = e.currentTarget as HTMLButtonElement;
                                        b.style.background = "rgba(255,255,255,0.1)";
                                        b.style.borderColor = "rgba(255,255,255,0.2)";
                                        b.style.color = "rgba(255,255,255,0.9)";
                                    }}
                                    onMouseLeave={e => {
                                        const b = e.currentTarget as HTMLButtonElement;
                                        b.style.background = "rgba(255,255,255,0.05)";
                                        b.style.borderColor = "rgba(255,255,255,0.11)";
                                        b.style.color = "rgba(255,255,255,0.6)";
                                    }}
                            >
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
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
        <div style={{
            display: "flex", gap: 4, padding: "4px", borderRadius: 10,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        }}>
            {(["grid", "list"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} title={`${m} view`} style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 30, height: 26, borderRadius: 7, border: "none", cursor: "pointer",
                    background: mode === m ? "rgba(255,255,255,0.14)" : "transparent",
                    color: mode === m ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.38)",
                    transition: "all 0.2s ease",
                }}>
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
function LogoGridCard({ project, index, onClick }: { project: LogoProject; index: number; onClick: () => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
            style={{
                borderRadius: 20, overflow: "hidden", cursor: "pointer",
                transform: hovered ? "translateY(-4px)" : "translateY(0)",
                ...glassBase(hovered),
            }}
        >
            <div style={{
                height: 190, background: project.imageBg,
                position: "relative", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
                    backgroundSize: "24px 24px", opacity: hovered ? 0.7 : 0.35, transition: "opacity 0.3s",
                }} />
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.17), transparent)" }} />
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.17), transparent)" }} />

                <motion.div animate={{ scale: hovered ? 1.07 : 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ position: "relative", zIndex: 2 }}>
                    <LogoPreview svgPreview={project.svgPreview} />
                </motion.div>

                <div style={{
                    position: "absolute", top: 14, right: 14,
                    fontFamily: "'Syne', sans-serif", fontSize: "9px",
                    fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
                    padding: "4px 10px", borderRadius: 6,
                    background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)",
                }}>{project.tag}</div>

                <motion.div animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }} style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
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
function LogoListRow({ project, index, onClick }: { project: LogoProject; index: number; onClick: () => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 20,
                padding: "14px 20px", borderRadius: 14, cursor: "pointer",
                ...glassBase(hovered),
            }}
        >
            {/* Swatch with SVG preview */}
            <div style={{
                width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                background: project.imageBg,
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
            }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "10px 10px", opacity: 0.4 }} />
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1 }}>
                    <path d={project.svgPreview} />
                </svg>
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
export default function LogosSection() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selected, setSelected] = useState<LogoProject | null>(null);

    useEffect(() => {
        document.body.style.overflow = selected ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [selected]);

    const close = useCallback(() => setSelected(null), []);

    return (
        <>
            <AnimatePresence>
                {selected && <ProjectModal project={selected} onClose={close} />}
            </AnimatePresence>

            <section id="logos" style={{ padding: "100px 0 120px" }}>
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
                                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", marginBottom: 4 }}>Logos</p>
                                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 3.2vw, 48px)", fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.08, color: "#fff" }}>
                                    Marks, Wordmarks &{" "}
                                    <em style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>Lettering</em>
                                </h2>
                            </div>
                        </div>
                        <ViewToggle mode={viewMode} setMode={setViewMode} />
                    </div>
                    <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)" }} />
                </motion.div>

                <AnimatePresence mode="wait">
                    {viewMode === "grid" ? (
                        <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                                    style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                            {LOGOS.map((p, i) => <LogoGridCard key={p.id} project={p} index={i} onClick={() => setSelected(p)} />)}
                        </motion.div>
                    ) : (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                                    style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {LOGOS.map((p, i) => <LogoListRow key={p.id} project={p} index={i} onClick={() => setSelected(p)} />)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </>
    );
}