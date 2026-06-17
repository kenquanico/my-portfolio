import { useRef, useState, useId } from "react";
import {
    motion,
    useTransform,
    useSpring,
    AnimatePresence,
    type MotionValue,
    type SpringOptions,
} from "framer-motion";
import { GlassFilter } from "./GlassFilter";

type DockItemProps = {
    children: React.ReactNode;
    mouseX: MotionValue<number>;
    spring: SpringOptions;
    distance: number;
    magnification: number;
    baseItemSize: number;
    label: string;
    onClick: () => void;
};

const TOOLTIP_STYLE: React.CSSProperties = {
    position:       "absolute",
    top:            "calc(100% + 10px)",
    left:           "50%",
    transform:      "translateX(-50%)",
    whiteSpace:     "nowrap",
    padding:        "5px 12px",
    borderRadius:   8,
    fontSize:       11,
    fontFamily:     "'Syne', system-ui, sans-serif",
    letterSpacing:  "0.06em",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    background:     "rgba(255,255,255,0.09)",
    border:         "0.75px solid rgba(255,255,255,0.22)",
    boxShadow:      "0 4px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22)",
    color:          "rgba(255,255,255,0.88)",
    pointerEvents:  "none",
    zIndex:         20,
};

// ─── Optical constants ────────────────────────────────────────────────────────
const ITEM_GLASS_FILL          = "rgba(118,104,178,0.08)";
const ITEM_GLASS_FILL_HOVERED  = "rgba(160,145,200,0.13)";

function itemBackdropFilter(filterId: string) {
    return `url(#${filterId}) blur(14px) saturate(180%) brightness(1.20) contrast(1.07)`;
}

function itemBackground(hovered: boolean) {
    return hovered
        ? `
            radial-gradient(ellipse 80% 50% at 30% 0%,
                rgba(255,255,255,0.38) 0%,
                rgba(255,255,255,0.10) 35%,
                transparent 60%
            ),
            linear-gradient(145deg,
                rgba(255,255,255,0.15) 0%,
                rgba(180,160,240,0.10) 45%,
                rgba(255,255,255,0.05) 100%
            )
          `
        : `
            radial-gradient(ellipse 80% 50% at 30% 0%,
                rgba(255,255,255,0.26) 0%,
                rgba(255,255,255,0.07) 35%,
                transparent 60%
            ),
            linear-gradient(145deg,
                rgba(255,255,255,0.09) 0%,
                rgba(118,104,178,0.08) 45%,
                rgba(255,255,255,0.03) 100%
            )
          `;
}

function itemBoxShadow(hovered: boolean) {
    return hovered
        ? `
            0 0 0 0.5px rgba(255,255,255,0.22),
            inset 0  1px 0 rgba(255,255,255,0.62),
            inset  1px 0 0 rgba(255,255,255,0.24),
            inset -1px 0 0 rgba(255,255,255,0.12),
            0 8px 28px rgba(0,0,0,0.28)
          `
        : `
            0 0 0 0.5px rgba(255,255,255,0.12),
            inset 0  1px 0 rgba(255,255,255,0.52),
            inset  1px 0 0 rgba(255,255,255,0.18),
            inset -1px 0 0 rgba(255,255,255,0.09),
            0 4px 16px rgba(0,0,0,0.20)
          `;
}

// ─── Glass highlight overlays ─────────────────────────────────────────────────
// These three layers are what make it READ as glass rather than acrylic:
//   1. Top caustic arc   — sharp specular from refracted light at the top edge
//   2. Bottom rim light  — secondary bounce from the curved bottom surface
//   3. Left edge caustic — chromatic streak from frequency-dependent refraction
function GlassHighlights() {
    return (
        <>
            {/* ① Top caustic arc — hard-at-top, quick falloff (NOT a soft glow) */}
            <div style={{
                position:   "absolute",
                top:        "6%",
                left:       "10%",
                right:      "10%",
                height:     "34%",
                borderRadius: "50%",
                background: `radial-gradient(ellipse at 50% 0%,
                    rgba(255,255,255,0.54) 0%,
                    rgba(255,255,255,0.14) 38%,
                    transparent 72%
                )`,
                pointerEvents: "none",
                filter:     "blur(0.4px)",
            }} />

            {/* ② Bottom rim — secondary refraction band */}
            <div style={{
                position:     "absolute",
                bottom:       "8%",
                left:         "16%",
                right:        "16%",
                height:       "18%",
                borderRadius: "50%",
                background:   "radial-gradient(ellipse, rgba(255,255,255,0.20) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* ③ Left edge caustic — chromatic tint (purple shift = freq-dependent refraction) */}
            <div style={{
                position:     "absolute",
                top:          "18%",
                bottom:       "18%",
                left:         "5%",
                width:        "14%",
                background:   `linear-gradient(90deg,
                    rgba(255,255,255,0.22) 0%,
                    rgba(200,180,255,0.10) 38%,
                    rgba(255,255,255,0.03) 65%,
                    transparent 100%
                )`,
                borderRadius: "50%",
                pointerEvents: "none",
            }} />
        </>
    );
}

// ─── DockItem ─────────────────────────────────────────────────────────────────
export function DockItem({
                             children,
                             mouseX,
                             spring,
                             distance,
                             magnification,
                             baseItemSize,
                             label,
                             onClick,
                         }: DockItemProps) {
    const ref      = useRef<HTMLDivElement | null>(null);
    const [hovered, setHovered] = useState(false);
    const filterId = useId().replace(/:/g, "-") + "-item";

    const mouseDistance = useTransform(mouseX, (val) => {
        const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
        return val - rect.x - baseItemSize / 2;
    });

    const targetSize = useTransform(
        mouseDistance,
        [-distance, 0, distance],
        [baseItemSize, magnification, baseItemSize],
    );
    const size = useSpring(targetSize, spring);

    return (
        <div style={{
            position:       "relative",
            zIndex:         2,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
        }}>
            {/* ── Magnifying bubble ── */}
            <motion.div
                ref={ref}
                data-glass-host
                style={{
                    width:      size,
                    height:     size,
                    flexShrink: 0,
                    position:   "relative",
                    display:    "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onHoverStart={() => setHovered(true)}
                onHoverEnd  ={() => setHovered(false)}
            >
                {/* SVG filter — turbulence-based lens warp (the real glass effect) */}
                <GlassFilter
                    id={filterId}
                    borderRadius={999}
                    brightness={55}
                    blur={4}
                    opacity={0.72}
                    distortionScale={-240}
                    fillColor={hovered ? ITEM_GLASS_FILL_HOVERED : ITEM_GLASS_FILL}
                    turbulenceFreq="0.04 0.05"
                    turbulenceSeed={3}
                />

                {/* ── Glass shell ── */}
                <motion.div
                    onClick={onClick}
                    whileTap={{ scale: 0.88 }}
                    style={{
                        width:        "100%",
                        height:       "100%",
                        borderRadius: "50%",
                        position:     "relative",
                        cursor:       "pointer",
                        overflow:     "hidden",

                        // Optical stack: filter → blur → saturate → brightness → contrast
                        backdropFilter:       itemBackdropFilter(filterId),
                        WebkitBackdropFilter: itemBackdropFilter(filterId),

                        // Two-layer background: caustic arc + base tint
                        background:  itemBackground(hovered),

                        border:    "0.75px solid rgba(255,255,255,0.28)",
                        boxShadow: itemBoxShadow(hovered),

                        transition: "background 0.22s ease, box-shadow 0.22s ease",
                    }}
                >
                    {/* Caustic + rim + chromatic edge overlays */}
                    <GlassHighlights />

                    {/* Icon */}
                    <div style={{
                        position:  "relative",
                        zIndex:    2,
                        width:     "100%",
                        height:    "100%",
                        display:   "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color:      hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.80)",
                        transition: "color 0.18s",
                    }}>
                        {children}
                    </div>
                </motion.div>
            </motion.div>

            {/* ── Tooltip ── */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial    ={{ opacity: 0, y: -4, scale: 0.85 }}
                        animate    ={{ opacity: 1, y: 0,  scale: 1    }}
                        exit       ={{ opacity: 0, y: -2, scale: 0.90 }}
                        transition ={{ duration: 0.15 }}
                        style={TOOLTIP_STYLE}
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}