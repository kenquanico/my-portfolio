import React, { useId } from "react";
import { motion, useMotionValue } from "framer-motion";
import { GlassFilter } from "./GlassFilter";
import { DockItem }    from "./DockItem";

type DockEntry = {
    icon:    React.ReactNode;
    label:   string;
    onClick: () => void;
};

type LiquidGlassDockProps = {
    items?: DockEntry[];
};

const SPRING = { mass: 0.1, stiffness: 220, damping: 16 };

// ─── Optical constants ────────────────────────────────────────────────────────
const DOCK_GLASS_FILL = "rgba(118,104,178,0.07)";

function dockBackdropFilter(filterId: string) {
    return `url(#${filterId}) blur(20px) saturate(210%) brightness(1.22) contrast(1.08)`;
}

// Multi-layer shadow: outer ring + depth + chromatic glow + inner edge lights
const DOCK_SHADOW = `
    0 0 0 0.5px rgba(255,255,255,0.32),
    0 24px 64px rgba(0,0,0,0.42),
    0 8px 24px rgba(0,0,0,0.26),
    0 4px 20px rgba(160,145,200,0.12),
    inset  0  1px 0 rgba(255,255,255,0.54),
    inset  1px 0  0 rgba(255,255,255,0.24),
    inset -1px 0  0 rgba(255,255,255,0.13),
    inset  0 -1px 0 rgba(255,255,255,0.18)
`;

const DIVIDER_STYLE: React.CSSProperties = {
    width:      1,
    height:     22,
    flexShrink: 0,
    position:   "relative",
    zIndex:     2,
    background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.14), transparent)",
};

// ─── LiquidGlassDock ─────────────────────────────────────────────────────────
/**
 * LiquidGlassDock
 *
 * Props:
 *   items – Array<{ icon: ReactNode, label: string, onClick: () => void }>
 *
 * Usage:
 *   <LiquidGlassDock items={[
 *     { icon: <HomeIcon />, label: "Home", onClick: () => {} },
 *   ]} />
 *
 * Glass optical stack (outermost → innermost):
 *   1. SVG filter  — feTurbulence → feDisplacementMap (real lens warp)
 *   2. backdropFilter — blur + saturate + brightness + contrast
 *   3. background  — 3-layer gradient: top caustic arc, bottom-right bounce, base tint
 *   4. border      — 0.75px with rgba for the optical boundary ring
 *   5. boxShadow   — outer depth + inset edge lights (4 edges, different intensity)
 *   6. Specular overlay div   — top-left caustic arc (screen blend)
 *   7. Rim light overlay div  — left/right edge caustic streaks
 *   8. Top caustic overlay    — sharp bright band along top curve
 */
export function LiquidGlassDock({ items = [] }: LiquidGlassDockProps) {
    const mouseX   = useMotionValue(Infinity);
    const filterId = useId().replace(/:/g, "-") + "-dock";

    return (
        <motion.div
            initial   ={{ opacity: 0, y: 20, scale: 0.92 }}
            animate   ={{ opacity: 1, y: 0,  scale: 1    }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onMouseMove ={({ clientX }) => mouseX.set(clientX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            style={{ position: "relative" }}
        >
            {/* ── Pill shell ── */}
            <div
                data-glass-host
                style={{
                    position:       "relative",
                    display:        "flex",
                    alignItems:     "center",
                    gap:            10,
                    padding:        "10px 18px",
                    borderRadius:   999,
                    isolation:      "isolate",
                    transform:      "translateZ(0)",
                    overflow:       "visible",

                    // Optical stack layer 1+2: SVG filter + backdrop blur chain
                    backdropFilter:       dockBackdropFilter(filterId),
                    WebkitBackdropFilter: dockBackdropFilter(filterId),

                    // Optical stack layer 3: 3-part background
                    // • Top-left caustic arc (dominant highlight)
                    // • Bottom-right secondary bounce
                    // • Base linear tint
                    background: `
                        radial-gradient(120% 90% at 18% -5%,
                            rgba(255,255,255,0.20) 0%,
                            rgba(160,145,200,0.09) 28%,
                            rgba(28,22,48,0.03) 55%,
                            transparent 100%
                        ),
                        radial-gradient(90% 120% at 85% 108%,
                            rgba(255,255,255,0.12) 0%,
                            rgba(99,89,133,0.07) 32%,
                            transparent 74%
                        ),
                        linear-gradient(145deg,
                            rgba(255,255,255,0.028) 0%,
                            rgba(118,104,178,0.055) 42%,
                            rgba(255,255,255,0.018) 100%
                        )
                    `,

                    // Optical stack layer 4: optical boundary ring
                    border:    "0.75px solid rgba(255,255,255,0.24)",

                    // Optical stack layer 5: depth + 4-edge inset lights
                    boxShadow: DOCK_SHADOW,
                }}
            >
                {/* SVG filter — turbulence lens warp */}
                <GlassFilter
                    id={filterId}
                    borderRadius={999}
                    brightness={52}
                    blur={4}
                    opacity={0.72}
                    distortionScale={-380}
                    fillColor={DOCK_GLASS_FILL}
                    turbulenceFreq="0.014 0.018"
                    turbulenceSeed={7}
                />

                {/* ── Optical stack layer 6: top caustic arc ── */}
                {/* Sharp bright band along the top curve — NOT a soft ambient glow */}
                <div
                    aria-hidden
                    style={{
                        position:      "absolute",
                        top:           0,
                        left:          0,
                        right:         0,
                        height:        "52%",
                        borderRadius:  "999px 999px 0 0",
                        background:    `linear-gradient(180deg,
                            rgba(255,255,255,0.44) 0%,
                            rgba(255,255,255,0.14) 20%,
                            rgba(255,255,255,0.04) 44%,
                            transparent 100%
                        )`,
                        // Mask fades at the pill ends so it follows the curved boundary
                        maskImage: `linear-gradient(90deg,
                            transparent 0%,
                            rgba(0,0,0,0.5) 6%,
                            rgba(0,0,0,0.9) 18%,
                            black 32%,
                            black 68%,
                            rgba(0,0,0,0.9) 82%,
                            rgba(0,0,0,0.5) 94%,
                            transparent 100%
                        )`,
                        pointerEvents: "none",
                        zIndex:        1,
                    }}
                />

                {/* ── Optical stack layer 7: rim light overlays ── */}
                {/* Left edge chromatic streak (purple-shifted = frequency-dependent refraction) */}
                <div
                    aria-hidden
                    style={{
                        position:      "absolute",
                        top:           "14%",
                        bottom:        "14%",
                        left:          0,
                        width:         "16%",
                        background:    `linear-gradient(90deg,
                            rgba(255,255,255,0.24) 0%,
                            rgba(200,180,255,0.10) 36%,
                            rgba(255,255,255,0.03) 64%,
                            transparent 100%
                        )`,
                        borderRadius:  "999px 0 0 999px",
                        pointerEvents: "none",
                        zIndex:        1,
                    }}
                />
                {/* Right edge mirror streak */}
                <div
                    aria-hidden
                    style={{
                        position:      "absolute",
                        top:           "14%",
                        bottom:        "14%",
                        right:         0,
                        width:         "12%",
                        background:    `linear-gradient(270deg,
                            rgba(255,255,255,0.16) 0%,
                            rgba(255,255,255,0.05) 40%,
                            transparent 100%
                        )`,
                        borderRadius:  "0 999px 999px 0",
                        pointerEvents: "none",
                        zIndex:        1,
                    }}
                />

                {/* ── Optical stack layer 8: screen-blend specular ── */}
                {/* Chromatic highlight in screen mode for the top-left lens flare */}
                <div
                    aria-hidden
                    style={{
                        position:      "absolute",
                        inset:         -1,
                        borderRadius:  "inherit",
                        pointerEvents: "none",
                        background:    `linear-gradient(108deg,
                            transparent 0%,
                            rgba(255,255,255,0.52) 7%,
                            rgba(255,255,255,0.04) 14%,
                            transparent 26%,
                            transparent 70%,
                            rgba(255,255,255,0.16) 88%,
                            transparent 100%
                        )`,
                        mixBlendMode:  "screen",
                        opacity:       0.60,
                        zIndex:        1,
                    }}
                />

                {/* ── Items + dividers ── */}
                {items.map((item, i) => (
                    <React.Fragment key={i}>
                        <DockItem
                            mouseX       ={mouseX}
                            spring       ={SPRING}
                            distance     ={120}
                            magnification={74}
                            baseItemSize ={50}
                            label        ={item.label}
                            onClick      ={item.onClick}
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