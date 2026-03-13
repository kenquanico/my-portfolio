import { useState } from "react";
import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface WebsiteProject {
    id: number;
    name: string;
    year: string;
    tag: string;
    tagline: string;
    // gradient used as image placeholder — replace src with actual image path
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
        imageBg: "linear-gradient(135deg, #1a0a3a 0%, #3d1f6e 50%, #6d28d9 100%)",
        imageAccent: "#7c6fff",
    },
    {
        id: 2,
        name: "Vessel CMS",
        year: "2024",
        tag: "Shipped",
        tagline: "Headless CMS · 40k+ creators",
        imageBg: "linear-gradient(135deg, #0a1628 0%, #0e2a52 50%, #1e4dd8 100%)",
        imageAccent: "#60a5fa",
    },
    {
        id: 3,
        name: "Delphi Finance",
        year: "2023",
        tag: "Live",
        tagline: "DeFi dashboard · Real-time analytics",
        imageBg: "linear-gradient(135deg, #001a12 0%, #064e3b 50%, #10b981 100%)",
        imageAccent: "#34d399",
    },
    {
        id: 4,
        name: "Nomad Spaces",
        year: "2023",
        tag: "Shipped",
        tagline: "Spatial booking · Remote work",
        imageBg: "linear-gradient(135deg, #1a0a0a 0%, #4c1d1d 50%, #dc2626 100%)",
        imageAccent: "#f87171",
    },
    {
        id: 5,
        name: "Lumis Health",
        year: "2023",
        tag: "Live",
        tagline: "Digital health · Patient portal",
        imageBg: "linear-gradient(135deg, #0a1a1a 0%, #164e63 50%, #0891b2 100%)",
        imageAccent: "#22d3ee",
    },
    {
        id: 6,
        name: "Prism Events",
        year: "2022",
        tag: "Shipped",
        tagline: "Event platform · Ticketing & scheduling",
        imageBg: "linear-gradient(135deg, #1a0a14 0%, #500724 50%, #db2777 100%)",
        imageAccent: "#f472b6",
    },
];

// ─── Card ─────────────────────────────────────────────────────────────────────
function WebsiteCard({ project, index }: { project: WebsiteProject; index: number }) {
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
                background: "#0e0b1a",
                border: `1px solid ${hovered ? "rgba(124,111,255,0.35)" : "rgba(255,255,255,0.06)"}`,
                boxShadow: hovered
                    ? "0 0 0 0.5px rgba(124,111,255,0.2), 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(124,111,255,0.08)"
                    : "0 4px 24px rgba(0,0,0,0.5)",
                transition: "all 0.38s cubic-bezier(0.16,1,0.3,1)",
                transform: hovered ? "translateY(-4px)" : "translateY(0)",
            }}
        >
            {/* Image area */}
            <div style={{
                height: 200,
                background: project.imageBg,
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Simulated browser chrome overlay */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: 32,
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", padding: "0 14px", gap: 6,
                }}>
                    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                        <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.85 }} />
                    ))}
                    <div style={{
                        flex: 1, height: 18, borderRadius: 5,
                        background: "rgba(255,255,255,0.08)",
                        marginLeft: 8,
                    }} />
                </div>

                {/* Abstract content placeholder */}
                <div style={{
                    position: "absolute", inset: 0, top: 32,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: "50%",
                        background: `radial-gradient(circle, ${project.imageAccent}44 0%, ${project.imageAccent}11 70%)`,
                        border: `1px solid ${project.imageAccent}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={project.imageAccent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <path d="M3 9h18M9 21V9" />
                        </svg>
                    </div>
                </div>

                {/* Hover shimmer */}
                <motion.div
                    animate={{ x: hovered ? "100%" : "-100%" }}
                    transition={{ duration: 0.55, ease: "easeInOut" }}
                    style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />
            </div>

            {/* Info area */}
            <div style={{ padding: "20px 22px 22px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <p style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(16px, 1.6vw, 20px)",
                        fontWeight: 400, letterSpacing: "-0.015em",
                        color: "rgba(230,220,255,0.97)", lineHeight: 1.2,
                    }}>
                        {project.name}
                    </p>
                    <span style={{
                        fontFamily: "'Syne', sans-serif", fontSize: "9px",
                        fontWeight: 600, letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        padding: "3px 9px", borderRadius: 5,
                        background: `${project.imageAccent}1a`,
                        border: `1px solid ${project.imageAccent}40`,
                        color: project.imageAccent,
                        whiteSpace: "nowrap", marginLeft: 8, marginTop: 2,
                    }}>
            {project.tag}
          </span>
                </div>
                <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "clamp(12px, 1.2vw, 13px)",
                    fontWeight: 300, color: "rgba(160,145,200,0.6)",
                    marginBottom: 14, lineHeight: 1.5,
                }}>
                    {project.tagline}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: "10px",
              fontWeight: 400, letterSpacing: "0.16em",
              color: "rgba(99,89,133,0.55)",
          }}>
            {project.year}
          </span>
                    <motion.div
                        animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.45 }}
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
export default function WebsitesSection() {
    return (
        <section id="websites" style={{ padding: "100px 0 80px" }}>
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
                        background: "linear-gradient(135deg, rgba(124,111,255,0.28), rgba(124,111,255,0.08))",
                        border: "1px solid rgba(124,111,255,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <path d="M3 9h18M9 21V9" />
                        </svg>
                    </div>
                    <div>
                        <p style={{
                            fontFamily: "'Syne', sans-serif", fontSize: "10px",
                            fontWeight: 500, letterSpacing: "0.28em",
                            textTransform: "uppercase", color: "rgba(124,111,255,0.75)",
                            marginBottom: 4,
                        }}>
                            01 — Websites
                        </p>
                        <h2 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(30px, 3.2vw, 48px)",
                            fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.08,
                            color: "#fff",
                        }}>
                            Web Design &{" "}
                            <em style={{ color: "rgba(124,111,255,0.85)", fontStyle: "italic" }}>
                                Development
                            </em>
                        </h2>
                    </div>
                </div>
                <div style={{
                    height: "1px",
                    background: "linear-gradient(90deg, rgba(124,111,255,0.35) 0%, rgba(99,89,133,0.15) 60%, transparent 100%)",
                }} />
            </motion.div>

            {/* Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
            }}>
                {WEBSITES.map((proj, i) => (
                    <WebsiteCard key={proj.id} project={proj} index={i} />
                ))}
            </div>
        </section>
    );
}