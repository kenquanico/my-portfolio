import { useState } from "react";
import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface GraphicProject {
    id: number;
    name: string;
    year: string;
    tag: string;
    tagline: string;
    imageBg: string;
    imageAccent: string;
    shape: "poster" | "square" | "wide"; // controls image height variation
}

const GRAPHICS: GraphicProject[] = [
    {
        id: 1,
        name: "Solaris Rebrand",
        year: "2024",
        tag: "Identity",
        tagline: "Full visual identity · Energy startup",
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
        imageBg: "linear-gradient(145deg, #00161a 0%, #004d5c 45%, #0891b2 100%)",
        imageAccent: "#22d3ee",
        shape: "wide",
    },
];

// ─── Abstract art shape for each card image ──────────────────────────────────
function AbstractArt({ accent, shape }: { accent: string; shape: GraphicProject["shape"] }) {
    if (shape === "poster") {
        return (
            <svg width="100%" height="100%" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
                <rect x="60" y="30" width="80" height="120" rx="4" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.35" />
                <rect x="72" y="44" width="56" height="6" rx="2" fill={accent} opacity="0.5" />
                <rect x="72" y="56" width="40" height="3" rx="1.5" fill={accent} opacity="0.3" />
                <rect x="72" y="63" width="48" height="3" rx="1.5" fill={accent} opacity="0.3" />
                <circle cx="100" cy="110" r="24" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.4" />
                <circle cx="100" cy="110" r="14" fill={accent} opacity="0.12" />
            </svg>
        );
    }
    if (shape === "square") {
        return (
            <svg width="100%" height="100%" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
                <polygon points="100,20 170,140 30,140" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.35" />
                <polygon points="100,45 148,130 52,130" fill={accent} opacity="0.08" />
                <line x1="60" y1="80" x2="140" y2="80" stroke={accent} strokeWidth="0.6" opacity="0.25" />
                <circle cx="100" cy="85" r="6" fill={accent} opacity="0.5" />
            </svg>
        );
    }
    // wide
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
            {[0, 1, 2, 3, 4].map((i) => (
                <rect key={i} x={30 + i * 28} y={40} width={18} height={60 - i * 6} rx="3" fill={accent} opacity={0.12 + i * 0.06} />
            ))}
            <line x1="30" y1="100" x2="170" y2="100" stroke={accent} strokeWidth="0.6" opacity="0.3" />
        </svg>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function GraphicCard({ project, index }: { project: GraphicProject; index: number }) {
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
                background: "#0d0b18",
                border: `1px solid ${hovered ? `${project.imageAccent}44` : "rgba(255,255,255,0.06)"}`,
                boxShadow: hovered
                    ? `0 0 0 0.5px ${project.imageAccent}22, 0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${project.imageAccent}0d`
                    : "0 4px 24px rgba(0,0,0,0.5)",
                transition: "all 0.38s cubic-bezier(0.16,1,0.3,1)",
                transform: hovered ? "translateY(-4px)" : "translateY(0)",
            }}
        >
            {/* Image area */}
            <div style={{
                height: 190,
                background: project.imageBg,
                position: "relative",
                overflow: "hidden",
            }}>
                <AbstractArt accent={project.imageAccent} shape={project.shape} />

                {/* Grain overlay for print feel */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                    pointerEvents: "none", opacity: 0.6,
                }} />

                {/* Tag floating in image */}
                <div style={{
                    position: "absolute", top: 14, right: 14,
                    fontFamily: "'Syne', sans-serif", fontSize: "9px",
                    fontWeight: 600, letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "4px 10px", borderRadius: 6,
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${project.imageAccent}40`,
                    color: project.imageAccent,
                }}>
                    {project.tag}
                </div>

                {/* Hover overlay */}
                <motion.div
                    animate={{ opacity: hovered ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                        position: "absolute", inset: 0,
                        background: `linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)`,
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
export default function GraphicsSection() {
    return (
        <section id="graphics" style={{ padding: "100px 0 80px" }}>
            {/* Divider from previous section */}
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
                        background: "linear-gradient(135deg, rgba(233,110,181,0.28), rgba(233,110,181,0.08))",
                        border: "1px solid rgba(233,110,181,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#e96eb5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                            <path d="M2 2l7.586 7.586" />
                            <circle cx="11" cy="11" r="2" />
                        </svg>
                    </div>
                    <div>
                        <p style={{
                            fontFamily: "'Syne', sans-serif", fontSize: "10px",
                            fontWeight: 500, letterSpacing: "0.28em",
                            textTransform: "uppercase", color: "rgba(233,110,181,0.75)",
                            marginBottom: 4,
                        }}>
                            02 — Graphics
                        </p>
                        <h2 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(30px, 3.2vw, 48px)",
                            fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.08,
                            color: "#fff",
                        }}>
                            Visual Identity &{" "}
                            <em style={{ color: "rgba(233,110,181,0.85)", fontStyle: "italic" }}>
                                Print
                            </em>
                        </h2>
                    </div>
                </div>
                <div style={{
                    height: "1px",
                    background: "linear-gradient(90deg, rgba(233,110,181,0.35) 0%, rgba(99,89,133,0.15) 60%, transparent 100%)",
                }} />
            </motion.div>

            {/* Grid — 3 col */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
            }}>
                {GRAPHICS.map((proj, i) => (
                    <GraphicCard key={proj.id} project={proj} index={i} />
                ))}
            </div>
        </section>
    );
}