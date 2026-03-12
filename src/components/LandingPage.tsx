import { useState } from "react";
import { motion } from "framer-motion";
import { LiquidGlassDock } from "./dock/LiquidGlassDock";
import Logo from "../assets/kenldry.svg";
import Plasma from "./Plasma";
import LiquidEther from "./LiquidEther.tsx";

/* ─── Color Palette ─────────────────────────────────────────────────────────── */
// #635985  — mid-violet (accent / interactive)
// #443C68  — deep grape (card / glass tint)
// #393053  — dark plum (border / subtle bg)
// #18122B  — near-black indigo (base background)

const PALETTE = {
    base:    "#000",
    dark:    "#393053",
    mid:     "#443C68",
    accent:  "#635985",
    accentLight: "rgba(99,89,133,0.55)",
    glow:    "rgba(99,89,133,0.18)",
};

/* ─── Global styles ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Syne:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${PALETTE.base}; overflow-x: hidden; }
  ::selection { background: ${PALETTE.accent}; color: #fff; }

  @keyframes scroll-bounce {
    0%,100% { transform: translateY(0); opacity: 0.4; }
    50%      { transform: translateY(8px); opacity: 0.9; }
  }
  @keyframes pulse-dot {
    0%,100% { opacity: 0.4; }
    50%      { opacity: 1; }
  }
  @keyframes shimmer-accent {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

/* ─── GlassCard ─────────────────────────────────────────────────────────────── */
function GlassCard({ children, style = {}, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative",
                borderRadius: 14,
                padding: "28px 32px",
                backdropFilter: "blur(40px) saturate(160%)",
                WebkitBackdropFilter: "blur(40px) saturate(160%)",
                background: hovered
                    ? `linear-gradient(135deg, rgba(99,89,133,0.18) 0%, rgba(68,60,104,0.12) 100%)`
                    : `linear-gradient(135deg, rgba(68,60,104,0.1) 0%, rgba(57,48,83,0.07) 100%)`,
                border: hovered
                    ? `1px solid rgba(99,89,133,0.4)`
                    : `1px solid rgba(99,89,133,0.16)`,
                boxShadow: hovered
                    ? `0 10px 50px rgba(0,0,0,0.8), inset 0 1.5px 0 rgba(99,89,133,0.3), 0 0 40px rgba(99,89,133,0.08)`
                    : `0 2px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(99,89,133,0.12)`,
                transition: "all 0.38s cubic-bezier(0.16,1,0.3,1)",
                overflow: "hidden",
                ...style,
            }}
        >
            <div style={{
                position: "absolute", top: 0, left: "8%", right: "8%", height: "1px",
                background: `linear-gradient(90deg, transparent, rgba(99,89,133,0.45), transparent)`,
                pointerEvents: "none",
            }} />
            {children}
        </motion.div>
    );
}

/* ─── SkillPill ─────────────────────────────────────────────────────────────── */
function SkillPill({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "inline-block",
                padding: "5px 15px",
                borderRadius: 999,
                fontSize: 10,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 400,
                letterSpacing: "0.07em",
                color: hovered ? "#d4cee8" : "rgba(177,165,210,0.45)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                background: hovered
                    ? `linear-gradient(135deg, rgba(99,89,133,0.28) 0%, rgba(68,60,104,0.18) 100%)`
                    : `rgba(68,60,104,0.12)`,
                border: hovered
                    ? `1px solid rgba(99,89,133,0.5)`
                    : `1px solid rgba(99,89,133,0.2)`,
                boxShadow: hovered
                    ? `inset 0 1px 0 rgba(99,89,133,0.3), 0 0 12px rgba(99,89,133,0.12)`
                    : "none",
                transition: "all 0.2s ease",
                cursor: "default",
            }}
        >
            {children}
        </motion.span>
    );
}

/* ─── WorkRow ────────────────────────────────────────────────────────────────── */
function WorkRow({ title, category, year, desc, index }: { title: string; category: string; year: string; desc: string; index: number }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.07 * index, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 80px",
                alignItems: "start",
                gap: 24,
                padding: "22px 24px",
                borderRadius: 12,
                background: hovered
                    ? `linear-gradient(135deg, rgba(99,89,133,0.1) 0%, rgba(68,60,104,0.06) 100%)`
                    : "transparent",
                border: hovered
                    ? `1px solid rgba(99,89,133,0.22)`
                    : `1px solid transparent`,
                backdropFilter: hovered ? "blur(20px)" : "none",
                WebkitBackdropFilter: hovered ? "blur(20px)" : "none",
                boxShadow: hovered
                    ? `inset 0 1px 0 rgba(99,89,133,0.18), 0 4px 24px rgba(0,0,0,0.4)`
                    : "none",
                transition: "all 0.28s ease",
                cursor: "pointer",
            }}
        >
            <span style={{
                fontFamily: "'Syne', sans-serif", fontSize: 10, letterSpacing: "0.05em",
                color: hovered ? "rgba(99,89,133,0.7)" : "rgba(99,89,133,0.3)",
                paddingTop: 2,
                transition: "color 0.2s",
            }}>
                0{index + 1}
            </span>
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 7, flexWrap: "wrap" }}>
                    <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 18, fontWeight: 400,
                        color: hovered ? "#e8e2f4" : "rgba(212,200,235,0.78)",
                        transition: "color 0.2s",
                    }}>{title}</span>
                    <span style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 9, letterSpacing: "0.12em",
                        color: "rgba(99,89,133,0.7)",
                        border: `1px solid rgba(99,89,133,0.28)`,
                        borderRadius: 3, padding: "2px 8px",
                        background: "rgba(68,60,104,0.15)",
                    }}>{category}</span>
                </div>
                <p style={{
                    fontFamily: "'Syne', sans-serif", fontSize: 12, lineHeight: 1.7,
                    color: "rgba(177,165,210,0.32)", letterSpacing: "0.01em",
                }}>
                    {desc}
                </p>
            </div>
            <span style={{
                fontFamily: "'Syne', sans-serif", fontSize: 10,
                color: "rgba(99,89,133,0.4)", letterSpacing: "0.05em",
                paddingTop: 2, textAlign: "right",
            }}>
                {year}
            </span>
        </motion.div>
    );
}

/* ─── Divider / SectionLabel ─────────────────────────────────────────────────── */
const Divider = () => (
    <div style={{
        height: "1px",
        background: `linear-gradient(90deg, transparent, rgba(99,89,133,0.28), transparent)`,
        margin: "0 0 60px",
    }} />
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        style={{
            fontFamily: "'Syne', sans-serif", fontSize: 9, letterSpacing: "0.24em",
            color: "rgba(99,89,133,0.55)", marginBottom: 32,
            textTransform: "uppercase", textAlign: "center",
        }}
    >
        {children}
    </motion.p>
);

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const Ico = ({ path, size = 18 }: { path: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
    </svg>
);

const ICONS = {
    user:  "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    work:  "M2 7h20a2 2 0 012 2v10a2 2 0 01-2 2H2a2 2 0 01-2-2V9a2 2 0 012-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
    mail:  "M2 4h20a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V6a2 2 0 012-2z m0 3 10 7 10-7",
    arrow: "M5 12h14 M12 5l7 7-7 7",
};

const GitHubIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const SKILLS = ["React", "TypeScript", "Node.js", "Figma", "Next.js", "GraphQL", "Motion", "Three.js", "Tailwind", "PostgreSQL", "Rust", "WebGL"];

const WORKS = [
    { title: "Prismatic",  category: "WEB APP",   year: "2025", desc: "A design system built around light refraction principles. Dark-mode first with glass morphism throughout." },
    { title: "Velvet CMS", category: "FULLSTACK", year: "2024", desc: "Headless content management platform serving 50k+ editors. Custom rich text engine, real-time collaboration." },
    { title: "Orbital",    category: "MOBILE",    year: "2024", desc: "Task management app with spatial UI. Nodes float in 3D space, grouped by gravity and context." },
    { title: "Solstice",   category: "BRANDING",  year: "2023", desc: "Full brand identity for a luxury wellness startup. Type, color, motion guidelines." },
];

/* ─── Portfolio ──────────────────────────────────────────────────────────────── */
export default function Portfolio() {
    const dockItems = [
        { icon: <Ico path={ICONS.user} />, label: "About",   onClick: () => {} },
        { icon: <Ico path={ICONS.work} />, label: "Work",    onClick: () => {} },
        { icon: <Ico path={ICONS.mail} />, label: "Contact", onClick: () => {} },
        { icon: <GitHubIcon />,            label: "GitHub",  onClick: () => {} },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
            <style>{GLOBAL_CSS}</style>

            {/* ── PLASMA BACKGROUND ─────────────────────────────────────────────── */}
            {/* ── PLASMA BACKGROUND ─────────────────────────────────────────────── */}
            <div style={{ position: "fixed", inset: 0, zIndex: 0, width: "100vw", height: "100vh" }}>
                <LiquidEther
                    style={{ width: "100%", height: "100%" }}
                    colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                    color0="#393053"
                    color1="#443C68"
                    color2="#635985"
                />
            </div>

            {/* ── DEEP VIGNETTE OVERLAY ─────────────────────────────────────────── */}
            <div style={{
                position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
                background: `radial-gradient(ellipse at 50% 40%, rgba(68,60,104,0.12) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.82) 100%)`,
            }} />

            {/* ── NAV ───────────────────────────────────────────────────────────── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "18px 52px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <img src={Logo} style={{ height: 45, width: "auto", display: "block" }} />
                <LiquidGlassDock items={dockItems} />
            </nav>

            {/* ── MAIN ──────────────────────────────────────────────────────────── */}
            <main style={{ position: "relative", zIndex: 10, padding: "0 52px" }}>

                {/* HERO */}
                <section style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    paddingTop: 80,
                }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.1, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(46px, 5.5vw, 84px)", fontWeight: 300,
                            lineHeight: 1.0, letterSpacing: "-0.035em",
                            color: "#e8e2f4",
                            marginBottom: 4,
                        }}
                    >
                        Ken Aldrey Quanico
                    </motion.h1>

                    <motion.h2
                        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(46px, 5.5vw, 84px)", fontWeight: 300,
                            fontStyle: "italic", lineHeight: 1.0, letterSpacing: "-0.035em",
                            color: "rgba(99,89,133,0.45)",
                            marginBottom: 40,
                        }}
                    >
                        designer & dev.
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.68 }}
                        style={{
                            fontFamily: "'Syne', sans-serif", fontSize: 14, lineHeight: 1.9,
                            color: "rgba(177,165,210,0.4)", maxWidth: 480,
                            letterSpacing: "0.01em", marginBottom: 44,
                        }}
                    >
                        I craft thoughtful digital experiences at the intersection of visual design and engineering — with obsessive attention to motion, light, and feel.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.82 }}
                        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 48, justifyContent: "center", maxWidth: 560 }}
                    >
                        {SKILLS.map((s, i) => <SkillPill key={s} delay={0.82 + i * 0.03}>{s}</SkillPill>)}
                    </motion.div>
                </section>

                {/* WORK */}
                <section style={{ paddingBottom: 100, maxWidth: 860, margin: "0 auto" }}>
                    <Divider />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                        <SectionLabel>Selected Work</SectionLabel>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, letterSpacing: "0.12em", color: "rgba(99,89,133,0.4)" }}>
                            {WORKS.length} PROJECTS
                        </span>
                    </div>
                    <div style={{
                        display: "grid", gridTemplateColumns: "48px 1fr 80px",
                        gap: 24, padding: "0 24px 16px",
                        borderBottom: `1px solid rgba(99,89,133,0.14)`,
                        marginBottom: 4,
                    }}>
                        {["#", "Project", "Year"].map(h => (
                            <span key={h} style={{
                                fontFamily: "'Syne', sans-serif", fontSize: 9,
                                letterSpacing: "0.14em", color: "rgba(99,89,133,0.38)",
                            }}>{h}</span>
                        ))}
                    </div>
                    {WORKS.map((w, i) => <WorkRow key={w.title} {...w} index={i} />)}
                </section>

                {/* CONTACT */}
                <section style={{ paddingBottom: 120, maxWidth: 860, margin: "0 auto" }}>
                    <Divider />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 40 }}>
                        <div>
                            <SectionLabel>Contact</SectionLabel>
                            <p style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(28px, 3.5vw, 52px)", fontWeight: 300,
                                fontStyle: "italic", color: "rgba(212,200,235,0.7)",
                                lineHeight: 1.25, letterSpacing: "-0.02em",
                            }}>
                                Let's make something beautiful together.
                            </p>
                        </div>
                        <GlassCard style={{ width: "100%", maxWidth: 520, textAlign: "left" }}>
                            <p style={{
                                fontFamily: "'Syne', sans-serif", fontSize: 12, lineHeight: 1.8,
                                color: "rgba(177,165,210,0.38)", marginBottom: 24, letterSpacing: "0.01em",
                            }}>
                                Open for select freelance projects, collaborations, and full-time roles starting Q3 2025.
                            </p>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <a href="mailto:hello@kenaldrey.co"
                                   style={{
                                       display: "inline-flex",
                                       alignItems: "center",
                                       gap: 10,
                                       padding: "10px 22px",
                                       borderRadius: 999,
                                       backdropFilter: "blur(16px)",
                                       WebkitBackdropFilter: "blur(16px)",
                                       background: `rgba(99,89,133,0.14)`,
                                       border: `1px solid rgba(99,89,133,0.32)`,
                                       boxShadow: `inset 0 1px 0 rgba(99,89,133,0.22)`,
                                       fontFamily: "'Syne', sans-serif",
                                       fontSize: 11,
                                       letterSpacing: "0.06em",
                                       color: "rgba(177,165,210,0.7)",
                                       textDecoration: "none",
                                       transition: "all 0.2s ease",
                                   }}
                                   onMouseEnter={e => {
                                       (e.currentTarget as HTMLAnchorElement).style.background = `rgba(99,89,133,0.28)`;
                                       (e.currentTarget as HTMLAnchorElement).style.color = "#e8e2f4";
                                       (e.currentTarget as HTMLAnchorElement).style.borderColor = `rgba(99,89,133,0.55)`;
                                       (e.currentTarget as HTMLAnchorElement).style.boxShadow = `inset 0 1px 0 rgba(99,89,133,0.3), 0 0 20px rgba(99,89,133,0.15)`;
                                   }}
                                   onMouseLeave={e => {
                                       (e.currentTarget as HTMLAnchorElement).style.background = `rgba(99,89,133,0.14)`;
                                       (e.currentTarget as HTMLAnchorElement).style.color = "rgba(177,165,210,0.7)";
                                       (e.currentTarget as HTMLAnchorElement).style.borderColor = `rgba(99,89,133,0.32)`;
                                       (e.currentTarget as HTMLAnchorElement).style.boxShadow = `inset 0 1px 0 rgba(99,89,133,0.22)`;
                                   }}
                                >
                                    hello@kenaldrey.co <Ico path={ICONS.arrow} size={11} />
                                </a>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
                        style={{
                            marginTop: 80, display: "flex", justifyContent: "space-between",
                            alignItems: "center", flexWrap: "wrap", gap: 16,
                            borderTop: `1px solid rgba(99,89,133,0.1)`,
                            paddingTop: 28,
                        }}
                    >
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "rgba(99,89,133,0.55)", letterSpacing: "0.04em" }}>ken.</span>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(99,89,133,0.28)" }}>© 2025 — ALL RIGHTS RESERVED</span>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}