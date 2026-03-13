import { useState } from "react";
import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LogoProject {
    id: number;
    name: string;
    year: string;
    tag: string;
    tagline: string;
    imageBg: string;
    imageAccent: string;
    // SVG path data to render as the "logo preview" inside the card
    svgPreview: string;
    svgType: "path" | "text" | "mark";
}

const LOGOS: LogoProject[] = [
    {
        id: 1,
        name: "Arklight Mark",
        year: "2024",
        tag: "Mark",
        tagline: "Architectural lighting studio",
        imageBg: "linear-gradient(145deg, #0a0f1a 0%, #0f2040 50%, #1a3a6b 100%)",
        imageAccent: "#93c5fd",
        svgPreview: "M12 3L3 8v8l9 5 9-5V8L12 3z M12 3v13 M3 8l9 5 M21 8l-9 5",
        svgType: "path",
    },
    {
        id: 2,
        name: "Fern & Root",
        year: "2024",
        tag: "Wordmark",
        tagline: "Botanical wellness brand",
        imageBg: "linear-gradient(145deg, #020f06 0%, #05260f 50%, #166534 100%)",
        imageAccent: "#86efac",
        svgPreview: "M12 22V12 M12 12C12 12 7 10 7 5a5 5 0 0110 0c0 5-5 7-5 7z M12 12C12 12 17 10 17 5",
        svgType: "path",
    },
    {
        id: 3,
        name: "Vero Type",
        year: "2023",
        tag: "Lettering",
        tagline: "Swiss-inspired type foundry",
        imageBg: "linear-gradient(145deg, #1a1400 0%, #3d2f00 50%, #78600a 100%)",
        imageAccent: "#fde68a",
        svgPreview: "M4 7h16 M12 7v13 M9 17h6",
        svgType: "path",
    },
    {
        id: 4,
        name: "Pulse Health",
        year: "2023",
        tag: "Mark",
        tagline: "Digital health platform",
        imageBg: "linear-gradient(145deg, #1a0014 0%, #3d0032 50%, #831843 100%)",
        imageAccent: "#f9a8d4",
        svgPreview: "M2 12h4l3-9 4 18 3-9h6",
        svgType: "path",
    },
    {
        id: 5,
        name: "Crest Studio",
        year: "2022",
        tag: "Mark",
        tagline: "Premium furniture brand",
        imageBg: "linear-gradient(145deg, #0a0a0a 0%, #1f1f1f 50%, #404040 100%)",
        imageAccent: "#e5e5e5",
        svgPreview: "M12 3l2.5 5.5L20 9.5l-4 4 1 5.5L12 16.5 7 19l1-5.5-4-4 5.5-.5L12 3z",
        svgType: "path",
    },
    {
        id: 6,
        name: "Nova Ventures",
        year: "2022",
        tag: "Wordmark",
        tagline: "VC firm · Growth-stage focus",
        imageBg: "linear-gradient(145deg, #00001a 0%, #000540 50%, #0a0f6b 100%)",
        imageAccent: "#a5b4fc",
        svgPreview: "M12 2L2 19h20L12 2z M12 8v6 M12 16v2",
        svgType: "path",
    },
];

// ─── Logo Preview SVG ─────────────────────────────────────────────────────────
function LogoPreview({ accent, svgPreview }: { accent: string; svgPreview: string }) {
    return (
        <div style={{
            width: 90, height: 90,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}1a 0%, transparent 70%)`,
            border: `1px solid ${accent}28`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
        }}>
            {/* Outer ring */}
            <div style={{
                position: "absolute", inset: -8, borderRadius: "50%",
                border: `0.5px solid ${accent}14`,
            }} />
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={svgPreview} />
            </svg>
        </div>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function LogoCard({ project, index }: { project: LogoProject; index: number }) {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                borderRadius: 20,
                overflow: "hidden",
                cursor: "pointer",
                background: "#0b0a16",
                border: `1px solid ${hovered ? `${project.imageAccent}40` : "rgba(255,255,255,0.06)"}`,
                boxShadow: hovered
                    ? `0 0 0 0.5px ${project.imageAccent}1a, 0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${project.imageAccent}0a`
                    : "0 4px 24px rgba(0,0,0,0.5)",
                transition: "all 0.38s cubic-bezier(0.16,1,0.3,1)",
                transform: hovered ? "translateY(-4px)" : "translateY(0)",
            }}
        >
            {/* Image area — centered logo preview */}
            <div style={{
                height: 190,
                background: project.imageBg,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {/* Grid dot pattern */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `radial-gradient(circle, ${project.imageAccent}18 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                    opacity: hovered ? 0.7 : 0.35,
                    transition: "opacity 0.3s",
                }} />

                {/* Center lines */}
                <div style={{
                    position: "absolute",
                    left: "50%", top: 0, bottom: 0,
                    width: "1px",
                    background: `linear-gradient(180deg, transparent, ${project.imageAccent}22, transparent)`,
                }} />
                <div style={{
                    position: "absolute",
                    top: "50%", left: 0, right: 0,
                    height: "1px",
                    background: `linear-gradient(90deg, transparent, ${project.imageAccent}22, transparent)`,
                }} />

                {/* The logo mark */}
                <motion.div
                    animate={{ scale: hovered ? 1.08 : 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{ position: "relative", zIndex: 2 }}
                >
                    <LogoPreview accent={project.imageAccent} svgPreview={project.svgPreview} />
                </motion.div>

                {/* Tag */}
                <div style={{
                    position: "absolute", top: 14, right: 14,
                    fontFamily: "'Syne', sans-serif", fontSize: "9px",
                    fontWeight: 600, letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "4px 10px", borderRadius: 6,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${project.imageAccent}33`,
                    color: project.imageAccent,
                }}>
                    {project.tag}
                </div>

                {/* Hover radial glow */}
                <motion.div
                    animate={{ opacity: hovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: "absolute", inset: 0,
                        background: `radial-gradient(circle at 50% 50%, ${project.imageAccent}10 0%, transparent 65%)`,
                        pointerEvents: "none",
                    }}
                />
            </div>

            {/* Info area */}
            <div style={{ padding: "18px 20px 20px" }}>
                <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(16px, 1.6vw, 19px)",
                    fontWeight: 400, letterSpacing: "-0.015em",
                    color: "rgba(230,220,255,0.97)", marginBottom: 6, lineHeight: 1.2,
                }}>
                    {project.name}
                </p>
                <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "clamp(11px, 1.1vw, 13px)",
                    fontWeight: 300, color: "rgba(160,145,200,0.58)",
                    marginBottom: 14, lineHeight: 1.5,
                }}>
                    {project.tagline}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: "10px",
              fontWeight: 400, letterSpacing: "0.16em",
              color: "rgba(99,89,133,0.5)",
          }}>
            {project.year}
          </span>
                    <motion.div
                        animate={{ x: hovered ? 3 : 0, opacity: hovered ? 1 : 0.4 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: project.imageAccent }}
                    >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function LogosSection() {
    return (
        <section id="logos" style={{ padding: "100px 0 120px" }}>
            {/* Divider */}
            <div style={{
                height: "1px", marginBottom: 100,
                background: "linear-gradient(90deg, transparent, rgba(99,89,133,0.2), transparent)",
            }} />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ marginBottom: 52 }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 11,
                        background: "linear-gradient(135deg, rgba(78,207,176,0.28), rgba(78,207,176,0.08))",
                        border: "1px solid rgba(78,207,176,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#4ecfb0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4l3 3" />
                        </svg>
                    </div>
                    <div>
                        <p style={{
                            fontFamily: "'Syne', sans-serif", fontSize: "10px",
                            fontWeight: 500, letterSpacing: "0.28em",
                            textTransform: "uppercase", color: "rgba(78,207,176,0.75)",
                            marginBottom: 4,
                        }}>
                            03 — Logos
                        </p>
                        <h2 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(30px, 3.2vw, 48px)",
                            fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.08,
                            color: "#fff",
                        }}>
                            Marks, Wordmarks &{" "}
                            <em style={{ color: "rgba(78,207,176,0.85)", fontStyle: "italic" }}>
                                Lettering
                            </em>
                        </h2>
                    </div>
                </div>
                <div style={{
                    height: "1px",
                    background: "linear-gradient(90deg, rgba(78,207,176,0.35) 0%, rgba(99,89,133,0.15) 60%, transparent 100%)",
                }} />
            </motion.div>

            {/* Grid — 3 col */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
            }}>
                {LOGOS.map((proj, i) => (
                    <LogoCard key={proj.id} project={proj} index={i} />
                ))}
            </div>
        </section>
    );
}