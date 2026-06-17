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
const DOCK_BACKDROP_FILTER = (filterId: string) =>
    `url(#${filterId}) blur(34px) saturate(190%) brightness(1.18) contrast(1.03)`;
const DOCK_GLASS_FILL = "rgba(255,255,255,0.16)";

// Apple liquid glass: bright specular arc top-left, soft glow bottom-right,
// ultra-thin outer ring that's barely visible.
const DOCK_SHADOW = `
  0 0 0 0.5px rgba(255,255,255,0.26),
  0 22px 62px rgba(0,0,0,0.34),
  0 4px 18px rgba(160,145,200,0.12),
  inset  1px  1px 0 rgba(255,255,255,0.72),
  inset -1px -1px 0 rgba(255,255,255,0.18),
  inset 0 -16px 28px rgba(255,255,255,0.06),
  inset 0 16px 34px rgba(255,255,255,0.14)
`;

const DIVIDER_STYLE = {
    width:      1,
    height:     20,
    flexShrink: 0,
    position:   "relative" as const,
    zIndex:     2,
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
                    backdropFilter:       DOCK_BACKDROP_FILTER(filterId),
                    WebkitBackdropFilter: DOCK_BACKDROP_FILTER(filterId),
                    background: `
                        linear-gradient(145deg,
                          rgba(255,255,255,0.24) 0%,
                          rgba(255,255,255,0.13) 36%,
                          rgba(255,255,255,0.075) 68%,
                          rgba(255,255,255,0.18) 100%
                        )
                    `,
                    border:       "1px solid rgba(255,255,255,0.22)",
                    boxShadow:    DOCK_SHADOW,
                    overflow:     "visible",
                    isolation:    "isolate",
                }}
            >
                {/* Hidden SVG filter */}
                <GlassFilter
                    id={filterId}
                    borderRadius={999}
                    brightness={52}
                    blur={12}
                    opacity={0.88}
                    distortionScale={-210}
                    fillColor={DOCK_GLASS_FILL}
                />

                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: -1,
                        borderRadius: "inherit",
                        pointerEvents: "none",
                        background: `
                            linear-gradient(110deg,
                              transparent 0%,
                              rgba(255,255,255,0.42) 11%,
                              transparent 24%,
                              transparent 74%,
                              rgba(255,255,255,0.16) 88%,
                              transparent 100%
                            )
                        `,
                        mixBlendMode: "screen",
                        opacity: 0.72,
                        zIndex: 0,
                    }}
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
                            radial-gradient(ellipse 68% 38% at 18% 0%,
                              rgba(255,255,255,0.72) 0%,
                              rgba(255,255,255,0.22) 46%,
                              transparent 100%
                            ),
                            radial-gradient(ellipse 54% 32% at 82% 100%,
                              rgba(255,255,255,0.28) 0%,
                              rgba(160,145,200,0.11) 48%,
                              transparent 70%
                            ),
                            linear-gradient(180deg,
                              rgba(255,255,255,0.16) 0%,
                              transparent 38%,
                              rgba(255,255,255,0.08) 100%
                            )
                        `,
                        zIndex: 1,
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
