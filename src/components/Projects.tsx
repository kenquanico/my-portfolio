import { useState, useRef, useEffect, useMemo, Children, cloneElement, forwardRef, isValidElement, useCallback } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import LiquidEther from "./LiquidEther.tsx";
import { LiquidGlassDock } from "./dock/LiquidGlassDock";
import Logo from "../assets/kenldry.svg";
import WebsitesSection from "./WebsiteSection";
import GraphicsSection from "./GraphicsSection";
import LogosSection from "./LogosSection";
import profilePhoto from "../assets/s2.jpg";
import { GRAPHICS, LOGOS, WEBSITES } from "../data/portfolioAssets";

// ─── Fonts ───────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Syne:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #000; overflow-x: hidden; }

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
// ─── Icons ───────────────────────────────────────────────────────────────────
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

// ─── Specular overlay ─────────────────────────────────────────────────────────
const SpecularOverlay = ({ hovered }: { hovered?: boolean }) => (
    <div aria-hidden style={{
        position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
        background: `radial-gradient(ellipse 70% 28% at 18% 0%,
      rgba(255,255,255,${hovered ? "0.36" : "0.20"}) 0%,
      rgba(255,255,255,0.04) 55%, transparent 100%)`,
        transition: "background 0.38s ease",
    }} />
);

// ─── CardSwap — swap-to-TOP logic ─────────────────────────────────────────────
interface CardSwapProps {
    width?: number;
    height?: number;
    cardDistance?: number;
    verticalDistance?: number;
    delay?: number;
    pauseOnHover?: boolean;
    onCardClick?: (idx: number) => void;
    children: React.ReactNode;
}
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const SwapCard = forwardRef<HTMLDivElement, CardProps>(({ ...rest }, ref) => (
    <div ref={ref} {...rest} style={{ position: "absolute", top: 0, left: 0, willChange: "transform", ...rest.style }} />
));
SwapCard.displayName = "SwapCard";

type Slot = { x: number; y: number; scale: number; opacity: number; zIndex: number; rotateZ: number };

const CardSwap: React.FC<CardSwapProps> = ({
                                               width = 520,
                                               height = 290,
                                               cardDistance = 20,
                                               verticalDistance = 32,
                                               delay = 4500,
                                               pauseOnHover = true,
                                               onCardClick,
                                               children,
                                           }) => {
    const childArr = useMemo(() => Children.toArray(children) as React.ReactElement<CardProps>[], [children]);
    const cardNodes = useRef<(HTMLDivElement | null)[]>([]);
    const order = useRef<number[]>([]);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const intervalRef = useRef<number | null>(null);
    const container = useRef<HTMLDivElement | null>(null);
    const total = childArr.length;

    const getSlot = useCallback((pos: number): Slot => {
        if (pos === 0) return { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 30, rotateZ: 0 };
        if (pos === 1) return { x: cardDistance, y: verticalDistance * 0.6, scale: 0.95, opacity: 0.78, zIndex: 20, rotateZ: 2.8 };
        return { x: cardDistance * 1.75, y: verticalDistance * 1.1, scale: 0.89, opacity: 0.45, zIndex: 10, rotateZ: 5.2 };
    }, [cardDistance, verticalDistance]);

    const getCardRef = useCallback((i: number) => (node: HTMLDivElement | null) => { cardNodes.current[i] = node; }, []);

    useEffect(() => {
        order.current = Array.from({ length: total }, (_, i) => i);
        const nodes = cardNodes.current.slice(0, total);
        if (!nodes.every(Boolean)) return;
        order.current.forEach((ci, pos) => {
            const el = cardNodes.current[ci];
            if (el) gsap.set(el, { ...getSlot(pos), transformOrigin: "center center", force3D: true });
        });
    }, [total, getSlot]);

    const swap = useCallback(() => {
        if (order.current.length < 2) return;
        const [front, ...rest] = order.current;
        const nextOrder = [...rest, front];
        const frontNode = cardNodes.current[front];
        if (!frontNode) return;
        tlRef.current?.kill();
        const tl = gsap.timeline({ onComplete: () => { order.current = nextOrder; } });
        tlRef.current = tl;
        tl.to(frontNode, { y: -90, x: -8, scale: 1.04, rotateZ: -3.5, opacity: 0.85, duration: 0.22, ease: "power2.out" });
        rest.forEach((ci, newPos) => {
            const node = cardNodes.current[ci];
            if (!node) return;
            const slot = getSlot(newPos);
            tl.to(node, { x: slot.x, y: slot.y, scale: slot.scale, opacity: slot.opacity, rotateZ: slot.rotateZ, zIndex: slot.zIndex, duration: 0.32, ease: "power2.inOut" }, 0.08);
        });
        const backSlot = getSlot(nextOrder.length - 1);
        tl.set(frontNode, { zIndex: backSlot.zIndex }, 0.08);
        tl.to(frontNode, { x: backSlot.x, y: backSlot.y, scale: backSlot.scale, opacity: backSlot.opacity, rotateZ: backSlot.rotateZ, duration: 0.34, ease: "elastic.out(0.85, 0.8)" }, 0.18);
    }, [getSlot]);

    useEffect(() => {
        const start = () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = window.setInterval(swap, delay);
        };
        start();
        if (pauseOnHover && container.current) {
            const el = container.current;
            const pause = () => { tlRef.current?.pause(); if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
            const resume = () => { tlRef.current?.resume(); start(); };
            el.addEventListener("mouseenter", pause);
            el.addEventListener("mouseleave", resume);
            return () => {
                el.removeEventListener("mouseenter", pause);
                el.removeEventListener("mouseleave", resume);
                tlRef.current?.kill();
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }
        return () => { tlRef.current?.kill(); if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [swap, delay, pauseOnHover]);

    const rendered = childArr.map((child, i) =>
        isValidElement<CardProps>(child)
            ? cloneElement(child, {
                key: i,
                ref: getCardRef(i),
                style: { width, height, ...(child.props.style ?? {}) },
                onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                    child.props.onClick?.(e);
                    onCardClick?.(i);
                },
            } as CardProps & { ref: React.RefCallback<HTMLDivElement> })
            : child
    );

    const stackW = width + cardDistance * 2.2 + 40;
    const stackH = height + verticalDistance * 1.4 + 100;

    return (
        <div ref={container} style={{ width: stackW, height: stackH, perspective: "1400px", position: "relative", overflow: "visible" }}>
            {rendered}
        </div>
    );
};

// ─── Project card data ────────────────────────────────────────────────────────
const CARD_DATA = [
    {
        key: "websites" as const,
        label: "Websites",
        labelColor: "#efeb51",
        count: WEBSITES.length,
        accent: "#efeb51",
        subtitle: "Web design & development",
        bg: "linear-gradient(145deg, #1a3a8a 0%, #2556c8 55%, #367bf5 100%)",
        borderColor: "rgba(239,235,81,0.5)",
        icon: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
        patternColor: "rgba(239,235,81,0.08)",
    },
    {
        key: "graphics" as const,
        label: "Graphics",
        labelColor: "#498dd6",
        count: GRAPHICS.length,
        accent: "#498dd6",
        subtitle: "Visual identity & print",
        bg: "linear-gradient(145deg, #020d1a 0%, #051525 55%, #081d34 100%)",
        borderColor: "rgba(73,141,214,0.5)",
        icon: "M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586 M11 11a2 2 0 102 2",
        patternColor: "rgba(73,141,214,0.08)",
    },
    {
        key: "logos" as const,
        label: "Logos",
        labelColor: "#d48a30",
        count: LOGOS.length,
        accent: "#d48a30",
        subtitle: "Marks, wordmarks & lettering",
        bg: "linear-gradient(145deg, #160101 0%, #230202 55%, #2e0302 100%)",
        borderColor: "rgba(212,138,48,0.5)",
        icon: "M12 8m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M4 13h8v7H4z M16 13l4 7h-8z",
        patternColor: "rgba(212,138,48,0.08)",
    },
] as const;

type CardKey = "websites" | "graphics" | "logos";

// ─── Project Stack Card ───────────────────────────────────────────────────────
function ProjectStackCard({
                              data,
                              onNavigate,
                          }: {
    data: typeof CARD_DATA[number];
    onNavigate: (key: CardKey) => void;
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onNavigate(data.key)}
            style={{
                width: "100%", height: "100%",
                borderRadius: 24,
                background: data.bg,
                border: `1px solid ${hovered ? data.borderColor : "rgba(255,255,255,0.08)"}`,
                boxShadow: hovered
                    ? `0 0 0 1px ${data.accent}28, 0 24px 72px rgba(0,0,0,0.8), 0 0 60px ${data.accent}12`
                    : "0 8px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
                transition: "all 0.38s cubic-bezier(0.16,1,0.3,1)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "36px 40px",
            }}
        >
            <SpecularOverlay hovered={hovered} />

            {/* Dot grid pattern */}
            <div aria-hidden style={{
                position: "absolute", inset: 0, borderRadius: "inherit",
                backgroundImage: `radial-gradient(circle, ${data.patternColor} 1.5px, transparent 1.5px)`,
                backgroundSize: "28px 28px",
                opacity: hovered ? 1 : 0.6,
                transition: "opacity 0.35s",
                pointerEvents: "none",
            }} />

            {/* Glow orb */}
            <div aria-hidden style={{
                position: "absolute", top: -60, right: -60,
                width: 220, height: 220, borderRadius: "50%",
                background: `radial-gradient(circle, ${data.accent}20 0%, transparent 70%)`,
                opacity: hovered ? 1 : 0.5,
                transition: "opacity 0.4s",
                pointerEvents: "none",
            }} />

            {/* Top: icon + big number */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
                <div style={{
                    width: 54, height: 54, borderRadius: 14,
                    background: `linear-gradient(135deg, ${data.accent}28, ${data.accent}0e)`,
                    border: `1px solid ${data.accent}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={data.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d={data.icon} />
                    </svg>
                </div>
                <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 48, fontWeight: 300,
                    color: "rgba(255,255,255,0.1)",
                    lineHeight: 1, letterSpacing: "-0.04em",
                }}>
                    {String(data.count).padStart(2, "0")}
                </p>
            </div>

            {/* Bottom: label + cta */}
            <div style={{ position: "relative" }}>
                <p style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "10px", fontWeight: 500,
                    letterSpacing: "0.26em", textTransform: "uppercase",
                    color: `${data.accent}cc`, marginBottom: 10,
                }}>
                    {data.subtitle}
                </p>
                <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(34px, 3.2vw, 44px)",
                    fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.05,
                    color: data.labelColor,
                    marginBottom: 22,
                }}>
                    {data.label}
                </p>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingTop: 18,
                    borderTop: `1px solid rgba(255,255,255,${hovered ? "0.1" : "0.06"})`,
                    transition: "border-color 0.3s",
                }}>
          <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: "11px",
              fontWeight: 500, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "rgba(160,145,200,0.55)",
          }}>
            {data.count} projects
          </span>
                    <motion.div
                        animate={{ x: hovered ? 5 : 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            fontFamily: "'Syne', sans-serif", fontSize: "11px",
                            fontWeight: 500, letterSpacing: "0.16em",
                            textTransform: "uppercase", color: data.accent,
                        }}
                    >
                        View all
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Projects({
                                     onNavigateHome,
                                     onNavigateToAbout,
                                 }: {
    onNavigateHome: () => void;
    onNavigateToAbout: () => void;
}) {
    const scrollToSection = (key: CardKey) => {
        const el = document.getElementById(key);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const [viewMode, setViewMode] = useState<"stack" | "list">("stack");

    const dockItems = [
        { icon: <Ico path={ICONS.user} />, label: "About",   onClick: onNavigateToAbout },
        { icon: <Ico path={ICONS.work} />, label: "Work",    onClick: () => {} },
        { icon: <Ico path={ICONS.mail} />, label: "Contact", onClick: onNavigateHome },
        { icon: <GitHubIcon />,            label: "GitHub",  onClick: () => {} },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
            <style>{GLOBAL_CSS}</style>

            {/* Fixed LiquidEther bg */}
            <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
                <LiquidEther
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

            {/* Nav */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "20px 56px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <img src={Logo} alt="Logo" onClick={onNavigateHome} style={{ height: 42, width: "auto" }} />                <LiquidGlassDock items={dockItems} />
            </nav>

            {/* ═══════════════════════════════════════════════
          HERO — full viewport height
      ═══════════════════════════════════════════════ */}
            <section style={{
                position: "relative", zIndex: 10,
                minHeight: "100vh",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "0 56px",
                maxWidth: 1280, margin: "0 auto",
            }}>
                {/* Big avatar */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 44, marginTop: 40 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ position: "relative", width: 200, height: 200 }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                            style={{
                                position: "absolute", inset: -5, borderRadius: "50%",
                                background: "conic-gradient(from 0deg, rgba(124,111,255,0.9), rgba(233,110,181,0.7), rgba(78,207,176,0.7), rgba(124,111,255,0.9))",
                                zIndex: 0,
                            }}
                        />
                        <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#000", zIndex: 1 }} />
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.28, 0.5, 0.28] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                position: "absolute", inset: -24, borderRadius: "50%",
                                background: "radial-gradient(circle, rgba(124,111,255,0.18) 0%, transparent 70%)",
                                zIndex: 0, pointerEvents: "none",
                            }}
                        />
                        <img
                            src={profilePhoto}
                            alt="Profile"
                            style={{
                                position: "absolute", inset: 4, zIndex: 2,
                                borderRadius: "80%",
                                width: "calc(100% - 8px)",
                                height: "calc(100% - 8px)",
                                objectFit: "cover",
                                objectPosition: "center top",
                                boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.28), 0 16px 72px rgba(0,0,0,0.9)",
                                display: "block",
                            }}
                        />

                    </motion.div>
                </div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.85, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ textAlign: "center", marginBottom: 64 }}
                >
                    <p style={{
                        fontFamily: "'Syne', sans-serif", fontSize: "11px",
                        fontWeight: 500, letterSpacing: "0.34em", textTransform: "uppercase",
                        color: "rgba(160,145,200,0.6)", marginBottom: 14,
                    }}>Portfolio</p>
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(48px, 5.5vw, 80px)",
                        fontWeight: 300, lineHeight: 1.04, letterSpacing: "-0.03em",
                        color: "#fff",
                    }}>
                        My <em style={{ color: "rgba(160,145,200,0.82)", fontStyle: "italic" }}>Projects</em>
                    </h1>
                    <div style={{
                        width: 56, height: 1, margin: "20px auto 0",
                        background: "linear-gradient(90deg, transparent, rgba(160,145,200,0.55), transparent)",
                    }} />
                </motion.div>


                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1px 1fr",
                    gap: "0 52px",
                    alignItems: "start",
                    paddingBottom: 60,
                }}>
                    {/* LEFT — bio */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                        style={{ display: "flex", flexDirection: "column", gap: 28 }}
                    >
                        <div>
                            <p style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500,
                                letterSpacing: "0.28em", textTransform: "uppercase",
                                color: "rgba(160,145,200,0.65)", marginBottom: 14,
                            }}>About</p>
                            <h2 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(28px, 2.8vw, 42px)",
                                fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.025em",
                                color: "#fff", marginBottom: 20,
                            }}>
                                Crafting{" "}
                                <em style={{ color: "rgba(160,145,200,0.75)", fontStyle: "italic" }}>digital worlds</em>
                                <br />that feel alive.
                            </h2>
                            <p style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "clamp(14px, 1.35vw, 16px)",
                                fontWeight: 300, lineHeight: 1.75,
                                color: "rgba(196,182,228,0.75)", marginBottom: 14,
                            }}>
                                I'm a designer and developer obsessed with interfaces that feel physical — that respond, breathe, and delight. I work at the intersection of visual identity, motion, and engineering.
                            </p>
                            <p style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "clamp(14px, 1.35vw, 16px)",
                                fontWeight: 300, lineHeight: 1.75,
                                color: "rgba(196,182,228,0.75)",
                            }}>
                                Based in the Philippines, I've shipped products used by thousands — from headless CMS platforms to spatial mobile apps.
                            </p>
                        </div>

                        {/* Stats */}
                        <div style={{
                            display: "flex", gap: 0,
                            padding: "20px 24px", borderRadius: 14,
                            background: "rgba(16,12,32,0.85)",
                            border: "1px solid rgba(99,89,133,0.2)",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                        }}>
                            {[["4+", "Years"], ["20+", "Projects"], ["50k+", "Users"]].map(([v, l], i, arr) => (
                                <div key={v} style={{
                                    flex: 1, textAlign: "center",
                                    borderRight: i < arr.length - 1 ? "1px solid rgba(99,89,133,0.2)" : "none",
                                    padding: "0 12px",
                                }}>
                                    <p style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: "clamp(24px, 2.4vw, 34px)", fontWeight: 300,
                                        color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 5,
                                    }}>{v}</p>
                                    <p style={{
                                        fontFamily: "'Syne', sans-serif", fontSize: "9px",
                                        fontWeight: 500, letterSpacing: "0.2em",
                                        textTransform: "uppercase", color: "rgba(160,145,200,0.55)",
                                    }}>{l}</p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <p style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "9px",
                                fontWeight: 500, letterSpacing: "0.24em",
                                textTransform: "uppercase", color: "rgba(160,145,200,0.55)", marginBottom: 10,
                            }}>Stack</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                                {["React", "TypeScript", "Figma", "GSAP", "Three.js", "Tailwind", "Node", "Framer"].map(s => (
                                    <span key={s} style={{
                                        display: "inline-flex", alignItems: "center",
                                        padding: "5px 13px", borderRadius: 999,
                                        background: "rgba(22,18,44,0.9)",
                                        border: "1px solid rgba(99,89,133,0.28)",
                                        fontFamily: "'Syne', sans-serif", fontSize: "10px",
                                        fontWeight: 500, letterSpacing: "0.12em",
                                        textTransform: "uppercase", color: "rgba(210,198,235,0.78)",
                                    }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* CENTER DIVIDER */}
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            width: "1px", alignSelf: "stretch", minHeight: 520,
                            background: "linear-gradient(180deg, transparent 0%, rgba(99,89,133,0.32) 18%, rgba(99,89,133,0.32) 82%, transparent 100%)",
                            transformOrigin: "top center",
                        }}
                    />

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                            gap: 20,
                            marginTop: 48,
                        }}
                    >
                        {/* Header row: "Categories" label + toggle */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: 440,
                        }}>
                            <p style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "10px",
                                fontWeight: 500, letterSpacing: "0.28em",
                                textTransform: "uppercase", color: "rgba(160,145,200,0.65)",
                                margin: 0,
                            }}>
                                Categories
                            </p>

                            {/* Toggle: Stack / List */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "4px",
                                borderRadius: 10,
                                background: "rgba(16,12,32,0.85)",
                                border: "1px solid rgba(99,89,133,0.25)",
                            }}>
                                {/* Stack icon button */}
                                <button
                                    onClick={() => setViewMode("stack")}
                                    title="Stack view"
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        width: 30, height: 26, borderRadius: 7,
                                        border: "none", cursor: "pointer",
                                        background: viewMode === "stack" ? "rgba(99,89,133,0.45)" : "transparent",
                                        color: viewMode === "stack" ? "rgba(210,198,235,0.95)" : "rgba(160,145,200,0.5)",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {/* Stack icon — overlapping cards */}
                                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" />
                                        <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                                        <path d="M6 3.5C6 3.5 4 4.5 4 7" opacity="0.5" />
                                    </svg>
                                </button>

                                {/* List icon button */}
                                <button
                                    onClick={() => setViewMode("list")}
                                    title="List view"
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        width: 30, height: 26, borderRadius: 7,
                                        border: "none", cursor: "pointer",
                                        background: viewMode === "list" ? "rgba(99,89,133,0.45)" : "transparent",
                                        color: viewMode === "list" ? "rgba(210,198,235,0.95)" : "rgba(160,145,200,0.5)",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {/* List icon — three horizontal rows */}
                                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="5" rx="1.5" />
                                        <rect x="3" y="10" width="18" height="5" rx="1.5" />
                                        <rect x="3" y="17" width="18" height="5" rx="1.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Stack view */}
                        {viewMode === "stack" && (
                            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                                <div style={{ marginLeft: "-18px" }}>
                                    <CardSwap
                                        width={440}
                                        height={270}
                                        cardDistance={18}
                                        verticalDistance={28}
                                        delay={2500}
                                        pauseOnHover
                                        onCardClick={(idx) => scrollToSection(CARD_DATA[idx].key)}
                                    >
                                        {CARD_DATA.map((data) => (
                                            <SwapCard key={data.key}>
                                                <ProjectStackCard data={data} onNavigate={scrollToSection} />
                                            </SwapCard>
                                        ))}
                                    </CardSwap>
                                </div>
                            </div>
                        )}

                        {/* List view */}
                        {viewMode === "list" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12,
                                    width: 440,
                                }}
                            >
                                {CARD_DATA.map((data, i) => (
                                    <motion.div
                                        key={data.key}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.38, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                                        onClick={() => scrollToSection(data.key)}
                                        style={{
                                            width: "100%",
                                            height: 82,
                                            borderRadius: 16,
                                            background: data.bg,
                                            border: `1px solid rgba(255,255,255,0.08)`,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "0 24px",
                                            gap: 18,
                                            position: "relative",
                                            overflow: "hidden",
                                            transition: "border-color 0.25s ease",
                                        }}
                                        whileHover={{ scale: 1.012, borderColor: data.borderColor } as any}
                                    >
                                        <SpecularOverlay />
                                        {/* Icon */}
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                            background: `linear-gradient(135deg, ${data.accent}28, ${data.accent}0e)`,
                                            border: `1px solid ${data.accent}44`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={data.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                                                <path d={data.icon} />
                                            </svg>
                                        </div>
                                        {/* Text */}
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                fontFamily: "'Playfair Display', serif",
                                                fontSize: 20, fontWeight: 300,
                                                color: data.labelColor,
                                                letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 4,
                                            }}>{data.label}</p>
                                            <p style={{
                                                fontFamily: "'Syne', sans-serif", fontSize: "9px",
                                                fontWeight: 500, letterSpacing: "0.22em",
                                                textTransform: "uppercase", color: "rgba(160,145,200,0.5)",
                                            }}>{data.subtitle}</p>
                                        </div>
                                        {/* Count + arrow */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <span style={{
                            fontFamily: "'Syne', sans-serif", fontSize: "10px",
                            fontWeight: 500, letterSpacing: "0.14em",
                            textTransform: "uppercase", color: `${data.accent}99`,
                        }}>{data.count} projects</span>
                                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={data.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}


                    </motion.div>
                </div>


            </section>


            <div style={{
                position: "relative", zIndex: 10}}>
                <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px" }}>
                    <WebsitesSection />
                    <GraphicsSection />
                    <LogosSection />
                </div>
            </div>
        </div>
    );
}
