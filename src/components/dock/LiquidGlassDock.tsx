import React, { useId } from "react";
import { motion, useMotionValue } from "framer-motion";
import { GlassFilter } from "./GlassFilter";
import { DockItem }    from "./DockItem";

type DockEntry = {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
};

type LiquidGlassDockProps = {
    items?: DockEntry[];
};

const SPRING = { mass: 0.1, stiffness: 220, damping: 16 };

// Apple liquid glass: bright specular arc top-left, soft glow bottom-right,
// ultra-thin outer ring that's barely visible.
const DOCK_SHADOW = `
  0 0 0 0.5px rgba(255,255,255,0.08),
  inset  1px  1px 0 0.5px rgba(255,255,255,0.55),
  inset -1px -1px 0 0.5px rgba(255,255,255,0.18)
`;

const DIVIDER_STYLE = {
    width:      1,
    height:     20,
    flexShrink: 0,
    background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)",
};

/**
 * LiquidGlassDock
 *
 * Props:
 *   items – Array<{ icon: ReactNode, label: string, onClick: () => void }>
 *
 * Usage:
 *   <LiquidGlassDock items={[
 *     { icon: <HomeIcon />, label: "Home", onClick: () => {} },
 *     ...
 *   ]} />
 */
export function LiquidGlassDock({ items = [] }: LiquidGlassDockProps) {
    const mouseX    = useMotionValue(Infinity);
    const filterId  = useId().replace(/:/g, "-") + "-dock";

    return (
        <motion.div
            initial   ={{ opacity: 0, y: 20, scale: 0.92 }}
            animate   ={{ opacity: 1, y: 0,  scale: 1    }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onMouseMove ={({ clientX }) => mouseX.set(clientX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            style={{ position: "relative" }}
        >
            {/* Pill shell — data-glass-host anchors the ResizeObserver in GlassFilter */}
            <div
                data-glass-host
                style={{
                    position:     "relative",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          10,
                    padding:      "10px 16px",
                    borderRadius: 99,
                    // Chromium: SVG refraction. WebKit: blur fallback.
                    backdropFilter:       `url(#${filterId}) blur(0.5px) saturate(140%)`,
                    WebkitBackdropFilter: "blur(24px) saturate(160%) brightness(1.1)",
                    background:   "transparent",
                    boxShadow:    DOCK_SHADOW,
                    overflow:     "visible",
                }}
            >
                {/* Hidden SVG filter */}
                <GlassFilter
                    id={filterId}
                    borderRadius={999}
                    brightness={52}
                    blur={12}
                    opacity={0.88}
                    distortionScale={-160}
                />

                {/*
                  Specular highlight overlay — mimics the bright curved light
                  Apple paints on the top-left and a softer reflection bottom-right.
                  pointer-events:none so it never blocks clicks.
                */}
                <div
                    aria-hidden
                    style={{
                        position:      "absolute",
                        inset:         0,
                        borderRadius:  "inherit",
                        pointerEvents: "none",
                        background: `
                            radial-gradient(ellipse 60% 35% at 18% 0%,
                              rgba(255,255,255,0.52) 0%,
                              rgba(255,255,255,0.10) 55%,
                              transparent 100%
                            ),
                            radial-gradient(ellipse 50% 30% at 82% 100%,
                              rgba(255,255,255,0.22) 0%,
                              transparent 70%
                            )
                        `,
                    }}
                />

                {/* Items + dividers */}
                {items.map((item, i) => (
                    <React.Fragment key={i}>
                        <DockItem
                            mouseX        ={mouseX}
                            spring        ={SPRING}
                            distance      ={120}
                            magnification ={72}
                            baseItemSize  ={48}
                            label         ={item.label}
                            onClick       ={item.onClick}
                        >
                            {item.icon}
                        </DockItem>

                        {i < items.length - 1 && <div style={DIVIDER_STYLE} />}
                    </React.Fragment>
                ))}
            </div>
        </motion.div>
    );
}