import { memo, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LiquidGlassDock } from "./dock/LiquidGlassDock";
import Logo from "../assets/kenldry.svg";
import TrueFocus from "./TrueFocus.tsx";
import { GlassFilter } from "./dock/GlassFilter.tsx";
import type { PortfolioAsset } from "../data/portfolioAssetUtils";
import { WEBSITES } from "../data/websiteAssets";
import WorkMedia from "./portfolio/WorkMedia";
import DeferredLiquidEther from "./DeferredLiquidEther";

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

  /* ── Custom Scrollbar ── */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.0);
  }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(
      180deg,
      rgba(99, 89, 133, 0.0) 0%,
      rgba(99, 89, 133, 0.55) 20%,
      rgba(130, 115, 180, 0.75) 50%,
      rgba(99, 89, 133, 0.55) 80%,
      rgba(99, 89, 133, 0.0) 100%
    );
    border-radius: 999px;
    border: none;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(
      180deg,
      rgba(99, 89, 133, 0.0) 0%,
      rgba(130, 115, 180, 0.85) 20%,
      rgba(160, 145, 200, 0.95) 50%,
      rgba(130, 115, 180, 0.85) 80%,
      rgba(99, 89, 133, 0.0) 100%
    );
  }
  ::-webkit-scrollbar-corner { background: transparent; }

  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(99, 89, 133, 0.55) transparent;
  }

  @media (max-width: 680px) {
    .selected-demo-row {
      grid-template-columns: 86px minmax(0, 1fr) !important;
    }

    .selected-demo-thumb {
      width: 86px !important;
      height: 58px !important;
    }

    .selected-demo-row > button {
      grid-column: 2;
      justify-self: start;
      margin-top: -4px;
    }

    .selected-demo-actions {
      grid-column: 2;
      justify-self: start;
      margin-top: -4px;
    }
  }

  .selected-demo-thumb .media-shell-swatch {
    width: 100% !important;
    height: 100% !important;
    aspect-ratio: auto !important;
    border-radius: 12px !important;
  }
`;

function useGlassFilterId() {
    return useId().replace(/:/g, "-");
}

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
                backdropFilter: `url(#${filterId}) blur(0.5px) saturate(140%)`,
                WebkitBackdropFilter: "blur(28px) saturate(160%) brightness(1.08)",
                background: hovered
                    ? `linear-gradient(135deg, rgba(99,89,133,0.16) 0%, rgba(68,60,104,0.10) 100%)`
                    : `linear-gradient(135deg, rgba(68,60,104,0.09) 0%, rgba(57,48,83,0.05) 100%)`,
                border: "none",
                boxShadow: hovered ? CARD_SHADOW_HOVERED : CARD_SHADOW_BASE,
                transition: "all 0.38s cubic-bezier(0.16,1,0.3,1)",
                overflow: "hidden",
                ...style,
            }}
            className="selected-demo-row"
        >
            <GlassFilter
                id={filterId}
                borderRadius={18}
                brightness={52}
                blur={10}
                opacity={0.88}
                distortionScale={-160}
            />
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

const SelectedDemoCard = memo(function SelectedDemoCard({
    project,
    index,
    onViewAll,
}: {
    project: PortfolioAsset;
    index: number;
    onViewAll: () => void;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                borderRadius: 18,
                overflow: "hidden",
                background: hovered
                    ? `linear-gradient(135deg, rgba(99,89,133,0.16) 0%, rgba(68,60,104,0.08) 100%)`
                    : `linear-gradient(135deg, rgba(68,60,104,0.09) 0%, rgba(57,48,83,0.05) 100%)`,
                border: `1px solid ${hovered ? "rgba(160,145,200,0.28)" : "rgba(99,89,133,0.14)"}`,
                backdropFilter: "blur(22px) saturate(150%)",
                WebkitBackdropFilter: "blur(22px) saturate(150%)",
                boxShadow: hovered
                    ? `inset 0 1px 0 rgba(255,255,255,0.16), 0 16px 50px rgba(0,0,0,0.62), 0 0 32px rgba(99,89,133,0.10)`
                    : `inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 28px rgba(0,0,0,0.42)`,
                transform: hovered ? "translateY(-4px)" : "translateY(0)",
                transition: "transform 0.28s ease, border-color 0.28s ease, background 0.28s ease",
                position: "relative",
                contain: "layout paint",
                display: "grid",
                gridTemplateColumns: "96px minmax(0, 1fr) auto",
                alignItems: "center",
                gap: 20,
                padding: "14px 18px",
            }}
        >
            <div className="selected-demo-thumb" style={{ position: "relative", overflow: "hidden", width: 96, height: 64, borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)", flexShrink: 0 }}>
                <WorkMedia project={project} mode="swatch" kind="websites" fit="cover" />
            </div>
            <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 7, flexWrap: "wrap" }}>
                    <h3 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(19px, 2vw, 24px)",
                        fontWeight: 400,
                        letterSpacing: "-0.01em",
                        color: hovered ? "#fff" : "rgba(230,220,255,0.92)",
                        transition: "color 0.2s",
                    }}>{project.name}</h3>
                </div>
                <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "clamp(12px, 1.2vw, 14px)",
                    fontWeight: 300,
                    lineHeight: 1.55,
                    color: "rgba(196,182,228,0.78)",
                    marginBottom: 8,
                }}>
                    {project.tagline}
                </p>
                <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "12px",
                    fontWeight: 300,
                    lineHeight: 1.5,
                    color: "rgba(196,182,228,0.55)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                }}>
                    {project.description}
                </p>
            </div>
            <div
                className="selected-demo-actions"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 10,
                    flexWrap: "wrap",
                }}
            >
                {project.liveUrl && (
                    <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open live demo for ${project.name}`}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            border: "1px solid rgba(160,145,200,0.26)",
                            background: hovered ? "rgba(160,145,200,0.18)" : "rgba(160,145,200,0.1)",
                            color: hovered ? "#fff" : "rgba(220,212,245,0.88)",
                            cursor: "pointer",
                            padding: "8px 12px",
                            borderRadius: 999,
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            transition: "color 0.2s ease, background 0.2s ease, border-color 0.2s ease",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Live Demo <Ico path={ICONS.arrow} size={11} />
                    </a>
                )}
                <button
                    type="button"
                    onClick={onViewAll}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 9,
                        border: "none",
                        background: "transparent",
                        color: hovered ? "#fff" : "rgba(160,145,200,0.78)",
                        cursor: "pointer",
                        padding: 0,
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "11px",
                        fontWeight: 500,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        transition: "color 0.2s ease",
                        whiteSpace: "nowrap",
                    }}
                >
                    View <Ico path={ICONS.arrow} size={12} />
                </button>
            </div>
        </motion.div>
    );
});

function SocialPill({ href, icon }: { href: string; icon: React.ReactNode }) {
    const [hovered, setHovered] = useState(false);
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: hovered ? "rgba(99,89,133,0.22)" : "rgba(99,89,133,0.10)",
                border: `1px solid ${hovered ? "rgba(99,89,133,0.55)" : "rgba(99,89,133,0.28)"}`,
                color: hovered ? "#fff" : "rgba(196,182,228,0.75)",
                boxShadow: hovered
                    ? "inset 0 1px 0 rgba(99,89,133,0.22), 0 0 16px rgba(99,89,133,0.12)"
                    : "none",
                transition: "all 0.22s ease",
                textDecoration: "none",
                flexShrink: 0,
            }}
        >
            {icon}
        </a>
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

// Social icons
const IGIcon = ({ size = 15 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
);

const FBIcon = ({ size = 15 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
);

const TikTokIcon = ({ size = 15 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
    </svg>
);

export default function Portfolio({
                                      onNavigateToAbout,
                                      onNavigateToProjects,
                                      onNavigateToContact,
                                  }: {
    onNavigateToAbout: () => void;
    onNavigateToProjects: () => void;
    onNavigateToContact: () => void;
}) {
    const openGitHub = () => window.open("https://github.com/kenquanico", "_blank", "noopener,noreferrer");
    const selectedDemos = useMemo(() => WEBSITES, []);
    const dockItems: DockItemConfig[] = [
        { icon: <Ico path={ICONS.user} />, label: "About",   onClick: onNavigateToAbout },
        { icon: <Ico path={ICONS.work} />, label: "Work",    onClick: onNavigateToProjects },
        { icon: <Ico path={ICONS.mail} />, label: "Contact", onClick: onNavigateToContact },
        { icon: <GitHubIcon />,            label: "GitHub",  onClick: openGitHub },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
            <style>{GLOBAL_CSS}</style>

            {/* BACKGROUND */}
            <div style={{ position: "fixed", inset: 0, zIndex: 0, width: "100vw", height: "100vh" }}>
                <DeferredLiquidEther
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
            <nav className="portfolio-nav" style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "20px 56px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <img src={Logo} alt="Ken Aldrey Quanico logo" width={42} height={42} decoding="async" style={{ height: 42, width: "auto", display: "block" }} />
                <LiquidGlassDock items={dockItems} />
            </nav>

            {/* MAIN */}
            <main className="portfolio-main" style={{ position: "relative", zIndex: 10, padding: "0 56px" }}>

                {/* HERO */}
                <section className="landing-hero" style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    paddingTop: 80,
                }}>
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

                    <motion.h1
                        className="landing-hero-title"
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

                    <motion.h2
                        className="landing-hero-title"
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

                    <motion.p
                        className="landing-hero-copy"
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
                <section style={{ paddingBottom: 110, maxWidth: 920, margin: "0 auto", contentVisibility: "auto", containIntrinsicSize: "900px" }}>
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
                            {selectedDemos.length} Demos
                        </span>
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        marginTop: 28,
                    }}>
                        {selectedDemos.map((demo, index) => (
                            <SelectedDemoCard
                                key={demo.src}
                                project={demo}
                                index={index}
                                onViewAll={onNavigateToProjects}
                            />
                        ))}
                    </div>
                </section>

                {/* CONTACT */}
                <section id="contact" style={{ paddingBottom: 130, maxWidth: 920, margin: "0 auto", scrollMarginTop: 110, contentVisibility: "auto", containIntrinsicSize: "560px" }}>
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
                                <a href="mailto:nekquanico@gmail.com"
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
                                    nekquanico@gmail.com <Ico path={ICONS.arrow} size={12} />
                                </a>
                            </div>
                        </GlassCard>
                    </div>

                    {/* FOOTER */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        style={{
                            marginTop: 88,
                            borderTop: `1px solid rgba(99,89,133,0.15)`,
                            paddingTop: 28,
                        }}
                    >
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 16,
                        }}>
                            {/* Logo */}
                            <img src={Logo} alt="Ken Aldrey Quanico logo" width={42} height={42} loading="lazy" decoding="async" style={{ height: 42, width: "auto", display: "block" }} />

                            {/* Social icons — centered */}
                            <div style={{ display: "flex", alignItems: "left", gap: 10 }}>
                                <SocialPill
                                    href="https://www.instagram.com/kenldry/?hl=en"
                                    icon={<IGIcon />}
                                />
                                <SocialPill
                                    href="https://web.facebook.com/kenldry"
                                    icon={<FBIcon />}
                                />
                                <SocialPill
                                    href="https://www.tiktok.com/@yeldraaaa"
                                    icon={<TikTokIcon />}
                                />
                            </div>

                            {/* Copyright */}

                        </div>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
