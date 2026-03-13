import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { LiquidGlassDock } from "./dock/LiquidGlassDock";
import Logo from "../assets/kenldry.svg";
import LiquidEther from "./LiquidEther.tsx";
import TrueFocus from "./TrueFocus.tsx";
import { GlassFilter } from "./dock/GlassFilter.tsx";

type DockItemConfig = {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
};

const PALETTE = {
    base:    "#000",
    dark:    "#393053",
    mid:     "#443C68",
    accent:  "#635985",
    accentLight: "rgba(99,89,133,0.55)",
    glow:    "rgba(99,89,133,0.18)",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Syne:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${PALETTE.base}; overflow-x: hidden; }
  ::selection { background: ${PALETTE.accent}; color: #fff; }
`;

let _glassFilterId = 0;
function useGlassFilterId() {
    const ref = useRef<string | null>(null);
    if (!ref.current) ref.current = `glass-filter-${_glassFilterId++}`;
    return ref.current;
}

// Matches LiquidGlassDock's ultra-thin outer ring + inset specular ring
const CARD_SHADOW_BASE = `
  0 0 0 0.5px rgba(255,255,255,0.06),
  inset  1px  1px 0 0.5px rgba(255,255,255,0.45),
  inset -1px -1px 0 0.5px rgba(255,255,255,0.12),
  0 4px 32px rgba(0,0,0,0.6)
`;
const CARD_SHADOW_HOVERED = `
  0 0 0 0.5px rgba(255,255,255,0.10),
  inset  1px  1px 0 0.5px rgba(255,255,255,0.60),
  inset -1px -1px 0 0.5px rgba(255,255,255,0.18),
  0 12px 56px rgba(0,0,0,0.8),
  0 0 40px rgba(99,89,133,0.10)
`;

function GlassCard({ children, style = {}, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
    const [hovered, setHovered] = useState(false);
    const filterId = useGlassFilterId();

    return (
        <motion.div
            data-glass-host
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative",
                borderRadius: 18,
                padding: "32px 36px",
                // Base BG: subtle tinted glass fill
                backdropFilter: `url(#${filterId}) blur(0.5px) saturate(140%)`,
                WebkitBackdropFilter: "blur(28px) saturate(160%) brightness(1.08)",
                background: hovered
                    ? `linear-gradient(135deg, rgba(99,89,133,0.16) 0%, rgba(68,60,104,0.10) 100%)`
                    : `linear-gradient(135deg, rgba(68,60,104,0.09) 0%, rgba(57,48,83,0.05) 100%)`,
                // Dock-style ring: no explicit border, use box-shadow inset rings instead
                border: "none",
                boxShadow: hovered ? CARD_SHADOW_HOVERED : CARD_SHADOW_BASE,
                transition: "all 0.38s cubic-bezier(0.16,1,0.3,1)",
                overflow: "hidden",
                ...style,
            }}
        >
            {/* Liquid glass chromatic-aberration displacement filter */}
            <GlassFilter
                id={filterId}
                borderRadius={18}
                brightness={52}
                blur={10}
                opacity={0.88}
                distortionScale={-160}
            />

            {/* Specular highlight — bright arc top-left, soft glow bottom-right (matches Dock) */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    pointerEvents: "none",
                    background: `
                        radial-gradient(ellipse 70% 30% at 16% 0%,
                          rgba(255,255,255,${hovered ? "0.46" : "0.34"}) 0%,
                          rgba(255,255,255,0.08) 55%,
                          transparent 100%
                        ),
                        radial-gradient(ellipse 55% 28% at 84% 100%,
                          rgba(255,255,255,${hovered ? "0.18" : "0.10"}) 0%,
                          transparent 70%
                        )
                    `,
                    transition: "background 0.38s ease",
                }}
            />

            {children}
        </motion.div>
    );
}

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
                gridTemplateColumns: "56px 1fr 80px",
                alignItems: "start",
                gap: 24,
                padding: "28px 24px",
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
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(11px, 1.2vw, 13px)",
                fontWeight: 400,
                letterSpacing: "0.12em",
                color: hovered ? "rgba(99,89,133,0.9)" : "rgba(99,89,133,0.6)",
                paddingTop: 3,
                transition: "color 0.2s",
            }}>
                0{index + 1}
            </span>
            <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(22px, 2.4vw, 28px)",
                        fontWeight: 400,
                        letterSpacing: "-0.01em",
                        color: hovered ? "#fff" : "rgba(230,220,255,0.92)",
                        transition: "color 0.2s",
                    }}>{title}</span>
                    <span style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "clamp(9px, 1vw, 11px)",
                        fontWeight: 500,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(180,165,220,0.9)",
                        border: `1px solid rgba(99,89,133,0.45)`,
                        borderRadius: 3,
                        padding: "3px 9px",
                        background: "rgba(68,60,104,0.3)",
                    }}>{category}</span>
                </div>
                <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "clamp(14px, 1.4vw, 16px)",
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: "rgba(196,182,228,0.78)",
                }}>
                    {desc}
                </p>
            </div>
            <span style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(11px, 1.2vw, 13px)",
                fontWeight: 400,
                letterSpacing: "0.1em",
                color: "rgba(99,89,133,0.75)",
                paddingTop: 3,
                textAlign: "right",
            }}>
                {year}
            </span>
        </motion.div>
    );
}

const Divider = () => (
    <div style={{
        height: "1px",
        background: `linear-gradient(90deg, transparent, rgba(99,89,133,0.24), transparent)`,
        margin: "0 0 72px",
    }} />
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(11px, 1.2vw, 13px)",
            fontWeight: 500,
            letterSpacing: "0.28em",
            color: "rgba(160,145,200,0.85)",
            marginBottom: 36,
            textTransform: "uppercase",
            textAlign: "center",
        }}
    >
        {children}
    </motion.p>
);

const Ico = ({ path, size = 16 }: { path: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
    </svg>
);

const ICONS = {
    user:  "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    work:  "M2 7h20a2 2 0 012 2v10a2 2 0 01-2 2H2a2 2 0 01-2-2V9a2 2 0 012-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
    mail:  "M2 4h20a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V6a2 2 0 012-2z m0 3 10 7 10-7",
    arrow: "M5 12h14 M12 5l7 7-7 7",
};

const GitHubIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

const WORKS = [
    { title: "Prismatic",  category: "Web App",   year: "2025", desc: "A design system built around light refraction principles. Dark-mode first with glass morphism throughout." },
    { title: "Velvet CMS", category: "Fullstack", year: "2024", desc: "Headless content management platform serving 50k+ editors. Custom rich text engine, real-time collaboration." },
    { title: "Orbital",    category: "Mobile",    year: "2024", desc: "Task management app with spatial UI. Nodes float in 3D space, grouped by gravity and context." },
    { title: "Solstice",   category: "Branding",  year: "2023", desc: "Full brand identity for a luxury wellness startup. Type, color, motion guidelines." },
];

export default function Portfolio({ onNavigateToAbout }: { onNavigateToAbout: () => void }) {
    const dockItems: DockItemConfig[] = [
        { icon: <Ico path={ICONS.user} />, label: "About",   onClick: onNavigateToAbout },
        { icon: <Ico path={ICONS.work} />, label: "Work",    onClick: () => {} },
        { icon: <Ico path={ICONS.mail} />, label: "Contact", onClick: () => {} },
        { icon: <GitHubIcon />,            label: "GitHub",  onClick: () => {} },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
            <style>{GLOBAL_CSS}</style>

            {/* BACKGROUND */}
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
                />
            </div>

            {/* VIGNETTE */}
            <div style={{
                position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
                background: `radial-gradient(ellipse at 50% 40%, rgba(68,60,104,0.12) 0%, rgba(0,0,0,0.58) 60%, rgba(0,0,0,0.86) 100%)`,
            }} />

            {/* NAV */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "20px 56px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <img src={Logo} alt="Ken Aldrey Quanico logo" style={{ height: 42, width: "auto", display: "block" }} />
                <LiquidGlassDock items={dockItems} />
            </nav>

            {/* MAIN */}
            <main style={{ position: "relative", zIndex: 10, padding: "0 56px" }}>

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
                    {/* Eyebrow */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "clamp(11px, 1.2vw, 14px)",
                            fontWeight: 500,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: "rgba(160,145,200,0.85)",
                            marginBottom: 28,
                        }}
                    >
                        Portfolio — 2026
                    </motion.p>

                    {/* Name — slightly reduced: was clamp(58px, 7.5vw, 108px), now clamp(46px, 6vw, 88px) */}
                    <motion.h1
                        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.1, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(46px, 6vw, 88px)",
                            fontWeight: 300,
                            lineHeight: 1.0,
                            letterSpacing: "-0.04em",
                            color: "#ffffff",
                            marginBottom: 6,
                        }}
                    >
                        Ken Aldrey Quanico
                    </motion.h1>

                    {/* Role — matching the reduced name size */}
                    <motion.h2
                        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.1, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(46px, 6vw, 88px)",
                            fontWeight: 300,
                            fontStyle: "italic",
                            lineHeight: 1.0,
                            letterSpacing: "-0.04em",
                            color: "rgba(160,145,200,0.72)",
                            marginBottom: 48,
                        }}
                    >
                        designer & dev.
                    </motion.h2>

                    {/* Bio — slightly reduced: was clamp(16px, 1.6vw, 20px), now clamp(14px, 1.3vw, 17px) */}
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.62 }}
                        style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "clamp(14px, 1.3vw, 17px)",
                            fontWeight: 300,
                            lineHeight: 1.75,
                            color: "rgba(210,200,235,0.82)",
                            maxWidth: 480,
                            marginBottom: 52,
                        }}
                    >
                        Crafting thoughtful digital experiences at the intersection of visual design and engineering — with obsessive attention to motion, light, and feel.
                    </motion.p>

                    {/* TrueFocus */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.78 }}
                    >
                        <TrueFocus
                            sentence="Designer Developer"
                            manualMode={false}
                            blurAmount={6}
                            borderColor="#635985"
                            glowColor="rgba(99,89,133,0.5)"
                            animationDuration={0.6}
                            pauseBetweenAnimations={1.5}
                        />
                    </motion.div>
                </section>

                {/* WORK */}
                <section style={{ paddingBottom: 110, maxWidth: 920, margin: "0 auto" }}>
                    <Divider />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                        <SectionLabel>Selected Work</SectionLabel>
                        <span style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "clamp(11px, 1.2vw, 13px)",
                            fontWeight: 400,
                            letterSpacing: "0.14em",
                            color: "rgba(160,145,200,0.7)",
                        }}>
                            {WORKS.length} Projects
                        </span>
                    </div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "56px 1fr 80px",
                        gap: 24,
                        padding: "0 24px 14px",
                        borderBottom: `1px solid rgba(99,89,133,0.22)`,
                        marginBottom: 4,
                    }}>
                        {["No.", "Project", "Year"].map(h => (
                            <span key={h} style={{
                                fontFamily: "'Syne', sans-serif",
                                fontSize: "clamp(10px, 1.1vw, 12px)",
                                fontWeight: 500,
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                                color: "rgba(160,145,200,0.65)",
                            }}>{h}</span>
                        ))}
                    </div>
                    {WORKS.map((w, i) => <WorkRow key={w.title} {...w} index={i} />)}
                </section>

                {/* CONTACT */}
                <section style={{ paddingBottom: 130, maxWidth: 920, margin: "0 auto" }}>
                    <Divider />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 44 }}>
                        <div>
                            <SectionLabel>Contact</SectionLabel>
                            <p style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(30px, 3.8vw, 58px)",
                                fontWeight: 300,
                                fontStyle: "italic",
                                color: "rgba(225,215,248,0.88)",
                                lineHeight: 1.2,
                                letterSpacing: "-0.02em",
                            }}>
                                Let's make something beautiful together.
                            </p>
                        </div>
                        <GlassCard style={{ width: "100%", maxWidth: 540, textAlign: "left" }}>
                            <p style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "clamp(15px, 1.5vw, 18px)",
                                fontWeight: 300,
                                lineHeight: 1.75,
                                color: "rgba(210,198,235,0.82)",
                                marginBottom: 28,
                            }}>
                                Open for select freelance projects, collaborations, and full-time roles starting Q3 2025.
                            </p>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <a href="nekquanico@gmail.com"
                                   style={{
                                       display: "inline-flex",
                                       alignItems: "center",
                                       gap: 10,
                                       padding: "13px 28px",
                                       borderRadius: 999,
                                       backdropFilter: "blur(16px)",
                                       WebkitBackdropFilter: "blur(16px)",
                                       background: `rgba(99,89,133,0.18)`,
                                       border: `1px solid rgba(99,89,133,0.4)`,
                                       boxShadow: `inset 0 1px 0 rgba(99,89,133,0.2)`,
                                       fontFamily: "'Syne', sans-serif",
                                       fontSize: "clamp(11px, 1.2vw, 13px)",
                                       fontWeight: 500,
                                       letterSpacing: "0.1em",
                                       textTransform: "uppercase",
                                       color: "rgba(210,198,235,0.9)",
                                       textDecoration: "none",
                                       transition: "all 0.2s ease",
                                   }}
                                   onMouseEnter={e => {
                                       const el = e.currentTarget as HTMLAnchorElement;
                                       el.style.background = `rgba(99,89,133,0.32)`;
                                       el.style.color = "#ffffff";
                                       el.style.borderColor = `rgba(99,89,133,0.65)`;
                                       el.style.boxShadow = `inset 0 1px 0 rgba(99,89,133,0.28), 0 0 20px rgba(99,89,133,0.18)`;
                                   }}
                                   onMouseLeave={e => {
                                       const el = e.currentTarget as HTMLAnchorElement;
                                       el.style.background = `rgba(99,89,133,0.18)`;
                                       el.style.color = "rgba(210,198,235,0.9)";
                                       el.style.borderColor = `rgba(99,89,133,0.4)`;
                                       el.style.boxShadow = `inset 0 1px 0 rgba(99,89,133,0.2)`;
                                   }}
                                >
                                    hello@kenaldrey.co <Ico path={ICONS.arrow} size={12} />
                                </a>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        style={{
                            marginTop: 88,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            flexWrap: "wrap",
                            gap: 16,
                            borderTop: `1px solid rgba(99,89,133,0.15)`,
                            paddingTop: 28,
                        }}
                    >
                        <img src={Logo} alt="Ken Aldrey Quanico logo" style={{ height: 42, width: "auto", display: "block" }}/>
                        <span style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "clamp(10px, 1.1vw, 12px)",
                            fontWeight: 400,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "rgba(160,145,200,0.55)",
                        }}>© 2026 — All Rights Reserved</span>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}