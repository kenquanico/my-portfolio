import { useId, useState } from "react";
import { motion } from "framer-motion";
import { LiquidGlassDock } from "./dock/LiquidGlassDock";
import { GlassFilter } from "./dock/GlassFilter.tsx";
import Logo from "../assets/kenldry.svg";
import profilePhoto from "../assets/s2-optimized.jpg";
import { ABOUT_GALLERY } from "../data/galleryAssets";
import DeferredLiquidEther from "./DeferredLiquidEther";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Syne:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #000; overflow-x: hidden; }

  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 28s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }
  .marquee-fade {
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
    mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  }

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
`;
// ─── Glass shadow tokens ──────────────────────────────────────────────────────
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

function useGlassId() {
    return useId().replace(/:/g, "-");
}

function GlassCard({
                       children,
                       style = {},
                       delay = 0,
                       borderRadius = 18,
                       padding = "32px 36px",
                       animate = true,
                   }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
    delay?: number;
    borderRadius?: number;
    padding?: string;
    animate?: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const filterId = useGlassId();

    const inner = (
        <div
            data-glass-host
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative",
                borderRadius,
                padding,
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
        >
            <GlassFilter id={filterId} borderRadius={borderRadius} brightness={52} blur={10} opacity={0.88} distortionScale={-160} />
            <div aria-hidden style={{
                position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
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
            }} />
            {children}
        </div>
    );

    if (!animate) return inner;
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}>
            {inner}
        </motion.div>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ico = ({ path, size = 16 }: { path: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
    </svg>
);
const ICONS = {
    user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    work: "M2 7h20a2 2 0 012 2v10a2 2 0 01-2 2H2a2 2 0 01-2-2V9a2 2 0 012-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
    mail: "M2 4h20a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V6a2 2 0 012-2z m0 3 10 7 10-7",
};
const GitHubIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

// ─── Tech Stack — white, no background, 52px ─────────────────────────────────
const S = 52; // icon size
const BrandIcon = ({ children }: { children: React.ReactNode }) => (
    <svg viewBox="0 0 64 64" fill="none" width={S} height={S} aria-hidden>
        {children}
    </svg>
);

const TECH_STACK: { name: string; svg: React.ReactNode }[] = [
    {
        name: "Figma",
        svg: (
            <BrandIcon>
                <circle cx="25" cy="16" r="9" fill="white" />
                <circle cx="39" cy="16" r="9" fill="white" opacity="0.82" />
                <circle cx="25" cy="32" r="9" fill="white" opacity="0.9" />
                <circle cx="39" cy="32" r="9" fill="white" opacity="0.7" />
                <circle cx="25" cy="48" r="9" fill="white" opacity="0.78" />
            </BrandIcon>
        ),
    },
    {
        name: "React JS/TS",
        svg: (
            <BrandIcon>
                <circle cx="28" cy="30" r="4" fill="white" />
                <ellipse cx="28" cy="30" rx="21" ry="8" stroke="white" strokeWidth="3" />
                <ellipse cx="28" cy="30" rx="21" ry="8" stroke="white" strokeWidth="3" transform="rotate(60 28 30)" />
                <ellipse cx="28" cy="30" rx="21" ry="8" stroke="white" strokeWidth="3" transform="rotate(120 28 30)" />
                <rect x="40" y="40" width="18" height="18" rx="3" fill="white" />
                <path d="M44 46h10M49 46v8M55 54c2 1 5 0 5-2 0-4-6-2-6-5 0-2 3-3 5-1" stroke="#050505" strokeWidth="2" strokeLinecap="round" />
            </BrandIcon>
        ),
    },
    {
        name: "PostgreSQL",
        svg: (
            <BrandIcon>
                <ellipse cx="32" cy="18" rx="19" ry="8" stroke="white" strokeWidth="4" />
                <path d="M13 18v23c0 5 8.5 9 19 9s19-4 19-9V18" stroke="white" strokeWidth="4" />
                <path d="M18 35c5 4 23 4 28 0" stroke="white" strokeWidth="3" opacity="0.75" />
                <path d="M40 27c6 2 9 6 8 10-1 5-7 5-12 2M35 25c-4 3-5 8-3 13" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="38" cy="22" r="2" fill="white" />
            </BrandIcon>
        ),
    },
    {
        name: "Tailwind",
        svg: (
            <BrandIcon>
                <path d="M32 18c-8.5 0-13.8 4.2-16 12.5 3.2-4.2 6.9-5.8 11.2-4.8 2.4.6 4.2 2.4 6.1 4.3 3.1 3.2 6.8 6.8 14.7 6.8 8.5 0 13.8-4.2 16-12.5-3.2 4.2-6.9 5.8-11.2 4.8-2.4-.6-4.2-2.4-6.1-4.3C43.6 21.6 39.9 18 32 18ZM16 36.8c-8.5 0-13.8 4.2-16 12.5 3.2-4.2 6.9-5.8 11.2-4.8 2.4.6 4.2 2.4 6.1 4.3 3.1 3.2 6.8 6.8 14.7 6.8 8.5 0 13.8-4.2 16-12.5-3.2 4.2-6.9 5.8-11.2 4.8-2.4-.6-4.2-2.4-6.1-4.3-3.1-3.2-6.8-6.8-14.7-6.8Z" fill="white" />
            </BrandIcon>
        ),
    },
    {
        name: "Adobe PS",
        svg: (
            <BrandIcon>
                <rect x="9" y="9" width="46" height="46" rx="8" stroke="white" strokeWidth="4" />
                <text x="18" y="41" fill="white" fontSize="20" fontWeight="700" fontFamily="Arial, sans-serif">Ps</text>
            </BrandIcon>
        ),
    },
    {
        name: "Adobe AI",
        svg: (
            <BrandIcon>
                <rect x="9" y="9" width="46" height="46" rx="8" stroke="white" strokeWidth="4" />
                <text x="19" y="41" fill="white" fontSize="20" fontWeight="700" fontFamily="Arial, sans-serif">Ai</text>
            </BrandIcon>
        ),
    },
    {
        name: "Python",
        svg: (
            <BrandIcon>
                <path d="M31 8h11c7 0 10 3 10 10v8c0 7-4 10-11 10H25c-5 0-8 3-8 8v5H7v-7c0-9 6-15 15-15h18v-4H24c-7 0-11-4-11-10S17 8 31 8Z" fill="white" />
                <path d="M33 56H22c-7 0-10-3-10-10v-8c0-7 4-10 11-10h16c5 0 8-3 8-8v-5h10v7c0 9-6 15-15 15H24v4h16c7 0 11 4 11 10S47 56 33 56Z" fill="white" opacity="0.72" />
                <circle cx="38" cy="16" r="2.3" fill="#050505" />
                <circle cx="26" cy="48" r="2.3" fill="#050505" />
            </BrandIcon>
        ),
    },
    {
        name: "PHP",
        svg: (
            <BrandIcon>
                <ellipse cx="32" cy="32" rx="27" ry="17" stroke="white" strokeWidth="4" />
                <text x="15" y="39" fill="white" fontSize="18" fontWeight="700" fontFamily="Arial, sans-serif">php</text>
            </BrandIcon>
        ),
    },
];

const MARQUEE_ITEMS = [...TECH_STACK, ...TECH_STACK];

// ─── Services data ────────────────────────────────────────────────────────────
const SERVICES = [
    {
        icon: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
        title: "Frontend Systems",
        desc: "Responsive React JS and TypeScript interfaces built with Tailwind, clean structure, and motion that supports the user flow.",
        accent: "#efeb51",
    },
    {
        icon: "M12 18.5A6.5 6.5 0 1 0 5.5 12M12 18.5V22M8 22h8",
        title: "Backend Logic",
        desc: "Practical PHP, Python, and PostgreSQL work for projects that need real data, automation, and dependable decision support.",
        accent: "#a78bfa",
    },
    {
        icon: "M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586",
        title: "Visual Design",
        desc: "People-focused interface and brand visuals shaped in Figma, Adobe Photoshop, and Adobe Illustrator.",
        accent: "#498dd6",
    },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AboutMe({
                                    onNavigateHome,
                                    onNavigateToProjects,
                                    onNavigateToContact,
                                }: {
    onNavigateHome: () => void;
    onNavigateToProjects: () => void;
    onNavigateToContact: () => void;
}) {
    const openGitHub = () => window.open("https://github.com/kenquanico", "_blank", "noopener,noreferrer");
    const dockItems = [
        // AboutMe.tsx — fixed
        { icon: <Ico path={ICONS.user} />,  label: "About",   onClick: () => {} },
        { icon: <Ico path={ICONS.work} />,  label: "Work",    onClick: onNavigateToProjects },  // ← was () => {}
        { icon: <Ico path={ICONS.mail} />,  label: "Contact", onClick: onNavigateToContact },
        { icon: <GitHubIcon />,             label: "GitHub",  onClick: openGitHub },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
            <style>{GLOBAL_CSS}</style>

            <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
                <DeferredLiquidEther
                    style={{ width: "100%", height: "100%" }}
                    colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
                    mouseForce={20} cursorSize={100}
                    isViscous viscous={30}
                    iterationsViscous={32} iterationsPoisson={32}
                    resolution={0.5} isBounce={false}
                    autoDemo autoSpeed={0.5} autoIntensity={2.2}
                    takeoverDuration={0.25} autoResumeDelay={3000} autoRampDuration={0.6}
                />
            </div>
            <div style={{
                position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 40%, rgba(68,60,104,0.12) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.88) 100%)",
            }} />

            <nav className="portfolio-nav" style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "20px 56px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <img src={Logo} alt="Logo" onClick={onNavigateHome} style={{ height: 42, width: "auto", cursor: "pointer" }} />
                <LiquidGlassDock items={dockItems} />
            </nav>

            {/* ══ SECTION 1 ══ */}
            <section className="about-hero" style={{
                position: "relative", zIndex: 10,
                minHeight: "100vh",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "120px 56px 80px",
                maxWidth: 1280, margin: "0 auto",
            }}>
                <div className="about-intro-grid" style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1px 1.4fr",
                    gap: "0 60px",
                    alignItems: "center",
                    marginBottom: 80,
                }}>
                    {/* LEFT */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
                    >
                        <div style={{ position: "relative", width: 180, height: 180 }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                                style={{
                                    position: "absolute", inset: -5, borderRadius: "50%",
                                    background: "conic-gradient(from 0deg, rgba(124,111,255,0.9), rgba(233,110,181,0.7), rgba(78,207,176,0.7), rgba(124,111,255,0.9))",
                                }}
                            />
                            <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#000" }} />
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                                style={{
                                    position: "absolute", inset: -28, borderRadius: "50%",
                                    background: "radial-gradient(circle, rgba(124,111,255,0.18) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }}
                            />
                            <img src={profilePhoto} alt="Ken Aldrey" style={{
                                position: "absolute", inset: 4, zIndex: 2,
                                borderRadius: "80%",
                                width: "calc(100% - 8px)", height: "calc(100% - 8px)",
                                objectFit: "cover", objectPosition: "center top",
                                boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.28), 0 16px 72px rgba(0,0,0,0.9)",
                                display: "block",
                            }} />
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <h1 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(26px, 2.6vw, 36px)", fontWeight: 300,
                                letterSpacing: "-0.02em", color: "#fff", lineHeight: 1.1, marginBottom: 8,
                            }}>Ken Aldrey Quanico</h1>
                            <p style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "11px", fontWeight: 500,
                                letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(160,145,200,0.65)",
                            }}>Designer & Developer</p>
                        </div>

                        <GlassCard delay={0.1} borderRadius={14} padding="18px 20px" style={{ width: "100%" }}>
                            <div style={{ display: "flex" }}>
                                {[["4+", "Years"], ["20+", "Projects"], ["Best", "Innovation"]].map(([v, l], i, arr) => (
                                    <div key={v} style={{
                                        flex: 1, textAlign: "center",
                                        borderRight: i < arr.length - 1 ? "1px solid rgba(99,89,133,0.2)" : "none",
                                        padding: "0 10px",
                                    }}>
                                        <p style={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontSize: "clamp(22px, 2.2vw, 30px)", fontWeight: 300,
                                            color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4,
                                        }}>{v}</p>
                                        <p style={{
                                            fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 500,
                                            letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(160,145,200,0.55)",
                                        }}>{l}</p>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <GlassCard delay={0.15} borderRadius={999} padding="8px 18px">
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{
                                    width: 7, height: 7, borderRadius: "50%", background: "#4ade80",
                                    boxShadow: "0 0 8px #4ade80, 0 0 16px rgba(74,222,128,0.4)",
                                }} />
                                <span style={{
                                    fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500,
                                    letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(160,145,200,0.7)",
                                }}>Available for work</span>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* DIVIDER */}
                    <motion.div
                        className="responsive-divider"
                        initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            width: "1px", alignSelf: "stretch", minHeight: 400,
                            background: "linear-gradient(180deg, transparent 0%, rgba(99,89,133,0.32) 18%, rgba(99,89,133,0.32) 82%, transparent 100%)",
                            transformOrigin: "top center",
                        }}
                    />

                    {/* RIGHT */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ display: "flex", flexDirection: "column", gap: 24 }}
                    >
                        <div>
                            <p
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: "10px",
                                    fontWeight: 500,
                                    letterSpacing: "0.32em",
                                    textTransform: "uppercase",
                                    color: "rgba(160,145,200,0.6)",
                                    marginBottom: 14,
                                }}
                            >
                                About Me
                            </p>

                            <h2
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: "clamp(30px, 3vw, 46px)",
                                    fontWeight: 300,
                                    lineHeight: 1.1,
                                    letterSpacing: "-0.025em",
                                    color: "#fff",
                                    marginBottom: 22,
                                }}
                            >
                                Precision in <em style={{ color: "rgba(160,145,200,0.8)", fontStyle: "italic" }}>design</em>.
                                <br />
                                Discipline in development.
                            </h2>

                            <p
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: "clamp(14px, 1.35vw, 16px)",
                                    fontWeight: 300,
                                    lineHeight: 1.8,
                                    color: "rgba(196,182,228,0.75)",
                                    marginBottom: 16,
                                }}
                            >
                                I design and develop digital interfaces for web and mobile platforms. My
                                work focuses on clarity, motion, and usability. I maintain a strong
                                commitment to continuous learning and regularly study emerging
                                technologies and development tools to strengthen both my technical and
                                design capabilities.
                            </p>

                            <p
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: "clamp(14px, 1.35vw, 16px)",
                                    fontWeight: 300,
                                    lineHeight: 1.8,
                                    color: "rgba(196,182,228,0.75)",
                                    marginBottom: 16,
                                }}
                            >
                                I create modern, high quality websites and mobile applications with
                                strong attention to visual structure and interaction design. Each
                                interface emphasizes refined aesthetics, performance, and usability.
                                Every element supports a clear and purposeful user experience.
                            </p>

                            <p
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: "clamp(14px, 1.35vw, 16px)",
                                    fontWeight: 300,
                                    lineHeight: 1.8,
                                    color: "rgba(196,182,228,0.75)",
                                }}
                            >
                                Outside of active development, I dedicate time to studying design
                                systems, motion design, and new development frameworks. Continuous
                                learning remains an important part of my process and allows me to adapt
                                quickly to evolving technologies and industry practices.
                            </p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {[
                                "Philippines",
                                "IT in Mobile App and Web Development",
                                "Freelance and Open to Opportunities",
                                "Filipino and English",
                            ].map((text, i) => (
                                <GlassCard
                                    key={text}
                                    delay={0.25 + i * 0.06}
                                    borderRadius={10}
                                    padding="12px 16px"
                                >
                                    <span
                                        style={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: "13px",
                                            fontWeight: 300,
                                            color: "rgba(196,182,228,0.8)",
                                        }}
                                    >
                                      {text}
                                    </span>
                                                            </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* What I Do */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div style={{ marginBottom: 28, textAlign: "center" }}>
                        <p style={{
                            fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500,
                            letterSpacing: "0.32em", textTransform: "uppercase",
                            color: "rgba(160,145,200,0.6)", marginBottom: 10,
                        }}>What I Do</p>
                        <div style={{ width: 48, height: 1, margin: "0 auto", background: "linear-gradient(90deg, transparent, rgba(160,145,200,0.45), transparent)" }} />
                    </div>
                    <div className="about-service-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                        {SERVICES.map((s, i) => (
                            <ServiceCard key={s.title} service={s} delay={0.55 + i * 0.1} />
                        ))}
                    </div>
                </motion.div>

                <PersonalGallery />
            </section>

            {/* ══ SECTION 2 — Tech Stack Marquee ══ */}
            <section style={{ position: "relative", zIndex: 10, paddingBottom: 120 }}>
                <div style={{ paddingTop: 80 }}>
                    <div className="portfolio-section-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px", marginBottom: 56 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ textAlign: "center", marginBottom: 16 }}
                        >
                            <p style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500,
                                letterSpacing: "0.32em", textTransform: "uppercase",
                                color: "rgba(160,145,200,0.6)", marginBottom: 12,
                            }}>Tech Stack</p>
                            <h2 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 300,
                                letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.1, marginBottom: 12,
                            }}>
                                Tools I{" "}
                                <em style={{ color: "rgba(160,145,200,0.8)", fontStyle: "italic" }}>work with</em>
                            </h2>
                            <div style={{ width: 48, height: 1, margin: "0 auto", background: "linear-gradient(90deg, transparent, rgba(160,145,200,0.45), transparent)" }} />
                        </motion.div>
                    </div>

                    <div
                        className="marquee-fade"
                        style={{
                            position: "relative", overflow: "hidden",
                            padding: "36px 0",
                            borderTop: "1px solid rgba(99,89,133,0.15)",
                            borderBottom: "1px solid rgba(99,89,133,0.15)",
                            background: "rgba(8,5,20,0.7)",
                        }}
                    >
                        <div className="marquee-track">
                            {MARQUEE_ITEMS.map((tech, i) => (
                                <MarqueeItem key={`${tech.name}-${i}`} tech={tech} />
                            ))}
                        </div>
                    </div>

                    {/* Stack group cards */}
                    <div className="portfolio-section-pad" style={{ maxWidth: 1280, margin: "60px auto 0", padding: "0 56px" }}>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="about-stack-grid"
                            style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 20 }}
                        >
                            {[
                                { cat: "Design", items: ["Figma", "Adobe PS", "Adobe AI"], accent: "#efeb51", icon: "M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586" },
                                { cat: "Frontend", items: ["React JS", "TypeScript", "Tailwind"], accent: "#a78bfa", icon: "M16 18l6-6-6-6 M8 6l-6 6 6 6" },
                                { cat: "Backend",  items: ["PostgreSQL", "Python", "PHP"], accent: "#4ade80", icon: "M4 6c0-2 4-4 8-4s8 2 8 4-4 4-8 4-8-2-8-4z M4 6v12c0 2 4 4 8 4s8-2 8-4V6 M4 12c0 2 4 4 8 4s8-2 8-4" },
                            ].map((group, i) => (
                                <StackGroup key={group.cat} group={group} delay={0.5 + i * 0.08} />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function PersonalGallery() {
    if (!ABOUT_GALLERY.length) return null;

    const [feature, ...rest] = ABOUT_GALLERY;
    const galleryItems = rest;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-[92px]"
        >
            <div style={{ marginBottom: 28, textAlign: "center" }}>
                <p style={{
                    fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500,
                    letterSpacing: "0.32em", textTransform: "uppercase",
                    color: "rgba(160,145,200,0.6)", marginBottom: 10,
                }}>Gallery</p>
                <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 300,
                    letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.1, marginBottom: 12,
                }}>
                    A few <em style={{ color: "rgba(160,145,200,0.8)", fontStyle: "italic" }}>frames</em> from me
                </h2>
                <div style={{ width: 48, height: 1, margin: "0 auto", background: "linear-gradient(90deg, transparent, rgba(160,145,200,0.45), transparent)" }} />
            </div>

            <GlassCard borderRadius={22} padding="18px" animate={false}>
                <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-3.5 max-[900px]:grid-cols-1">
                    <div className="group relative min-h-[430px] overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] max-[900px]:min-h-[380px] max-[620px]:min-h-[320px]">
                        <img className="block h-full w-full object-cover contrast-[1.04] saturate-[0.95] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] group-hover:contrast-[1.06] group-hover:saturate-[1.08]" src={feature.previewSrc ?? feature.src} alt={feature.name} width={1200} height={900} loading="lazy" decoding="async" />
                        <div className="absolute bottom-[18px] left-[18px] right-[18px] rounded-[14px] border border-white/10 bg-black/45 px-4 py-3.5 backdrop-blur-2xl backdrop-saturate-150">
                            <span className="font-['Syne'] text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60">01</span>
                            <p className="m-0 mt-1 font-['Playfair_Display'] text-[clamp(18px,2vw,24px)] font-light leading-[1.1] text-white/95">{feature.name}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 auto-rows-[136px] gap-3.5 max-[620px]:auto-rows-[120px] max-[620px]:gap-2.5 max-[430px]:grid-cols-1">
                        {galleryItems.map((item, index) => (
                            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] [@media(min-width:431px)]:[&:nth-child(3n+1)]:row-span-2 max-[620px]:rounded-xl" key={item.src}>
                                <img className="block h-full w-full object-cover contrast-[1.04] saturate-[0.95] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] group-hover:contrast-[1.06] group-hover:saturate-[1.08]" src={item.previewSrc ?? item.src} alt={item.name} width={800} height={600} loading="lazy" decoding="async" />
                                <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-2 py-1 font-['Syne'] text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60 backdrop-blur-xl">{String(index + 2).padStart(2, "0")}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ service, delay }: { service: typeof SERVICES[0]; delay: number }) {
    return (
        <GlassCard delay={delay} borderRadius={20} padding="28px 28px 24px">
            <div aria-hidden style={{
                position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
                backgroundImage: `radial-gradient(circle, ${service.accent}0a 1.5px, transparent 1.5px)`,
                backgroundSize: "24px 24px", opacity: 0.6,
            }} />
            <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: `linear-gradient(135deg, ${service.accent}28, ${service.accent}0e)`,
                border: `1px solid ${service.accent}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18, position: "relative",
            }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={service.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d={service.icon} />
                </svg>
            </div>
            <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(18px, 1.8vw, 22px)", fontWeight: 300,
                letterSpacing: "-0.015em", color: service.accent, marginBottom: 10, position: "relative",
            }}>{service.title}</h3>
            <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(13px, 1.2vw, 14px)", fontWeight: 300,
                lineHeight: 1.7, color: "rgba(196,182,228,0.7)", position: "relative",
            }}>{service.desc}</p>
        </GlassCard>
    );
}

// ─── Marquee Item ─────────────────────────────────────────────────────────────
function MarqueeItem({ tech }: { tech: { name: string; svg: React.ReactNode } }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 12,
                width: 130, flexShrink: 0,
                padding: "16px 0",
                opacity: hovered ? 1 : 0.5,
                transform: `scale(${hovered ? 1.12 : 1})`,
                transition: "all 0.25s ease",
                cursor: "default",
                color: "#fff",
            }}
        >
            {tech.svg}
            <span style={{
                fontFamily: "'Syne', sans-serif", fontSize: "9px", fontWeight: 500,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(160,145,200,0.65)", textAlign: "center",
            }}>{tech.name}</span>
        </div>
    );
}

// ─── Stack Group Card ─────────────────────────────────────────────────────────
function StackGroup({ group, delay }: { group: { cat: string; items: string[]; accent: string; icon: string }; delay: number }) {
    return (
        <GlassCard delay={delay} borderRadius={16} padding="24px 24px 20px">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: `linear-gradient(135deg, ${group.accent}22, ${group.accent}0c)`,
                    border: `1px solid ${group.accent}38`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={group.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d={group.icon} />
                    </svg>
                </div>
                <span style={{
                    fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500,
                    letterSpacing: "0.24em", textTransform: "uppercase", color: `${group.accent}cc`,
                }}>{group.cat}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {group.items.map(item => (
                    <span key={item} style={{
                        padding: "5px 13px", borderRadius: 999,
                        background: "rgba(22,18,44,0.6)",
                        border: "1px solid rgba(99,89,133,0.22)",
                        fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500,
                        letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(210,198,235,0.72)",
                    }}>{item}</span>
                ))}
            </div>
        </GlassCard>
    );
}
