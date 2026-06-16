import { useRef, useState, useId } from "react";
import { motion, useTransform, useSpring, AnimatePresence, type MotionValue, type SpringOptions } from "framer-motion";
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

const TOOLTIP_STYLE = {
    marginTop:      8,
    whiteSpace:     "nowrap" as const,
    padding:        "5px 12px",
    borderRadius:   8,
    fontSize:       10,
    fontFamily:     "'Syne', sans-serif",
    letterSpacing:  "0.1em",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    background:     "rgba(255,255,255,0.08)",
    border:         "1px solid rgba(255,255,255,0.2)",
    boxShadow:      "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
    color:          "rgba(255,255,255,0.85)",
    pointerEvents:  "none" as const,
    zIndex:         20,
};

const ITEM_GLASS_FILL = "rgba(255,255,255,0.13)";
const ITEM_GLASS_FILL_HOVERED = "rgba(255,255,255,0.20)";
const ITEM_BACKDROP_FILTER = (filterId: string) =>
    `url(#${filterId}) blur(14px) saturate(170%) brightness(1.12)`;

// Specular / caustic overlays that sit on top of the icon
function GlassHighlights() {
    return (
        <>
            {/* Top specular blob */}
            <div style={{
                position:   "absolute", top: "8%", left: "15%", right: "15%", height: "28%",
                borderRadius: "50%",
                background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 75%)",
                pointerEvents: "none",
                filter: "blur(1px)",
            }} />
            {/* Bottom rim light */}
            <div style={{
                position:     "absolute", bottom: "10%", left: "20%", right: "20%", height: "18%",
                borderRadius: "50%",
                background:   "radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            {/* Left edge caustic */}
            <div style={{
                position:     "absolute", top: "20%", bottom: "20%", left: "6%", width: "12%",
                background:   "linear-gradient(90deg, rgba(255,255,255,0.14) 0%, transparent 100%)",
                borderRadius: "50%",
                pointerEvents: "none",
            }} />
        </>
    );
}

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
    const ref = useRef<HTMLDivElement | null>(null);
    const [hovered, setHovered] = useState(false);
    const filterId   = useId().replace(/:/g, "-") + "-item";

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

    const shellShadow = hovered
        ? `0 0 0 0.5px rgba(255,255,255,0.20),
           inset  1px  1px 0 0.5px rgba(255,255,255,0.55),
           inset -1px -1px 0 0.5px rgba(255,255,255,0.18),
           0 4px 16px rgba(0,0,0,0.18)`
        : `0 0 0 0.5px rgba(255,255,255,0.08),
           inset  1px  1px 0 0.5px rgba(255,255,255,0.45),
           inset -1px -1px 0 0.5px rgba(255,255,255,0.12)`;

    return (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* Magnifying bubble */}
            <motion.div
                ref={ref}
                data-glass-host
                style={{ width: size, height: size, flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
                onHoverStart={() => setHovered(true)}
                onHoverEnd  ={() => setHovered(false)}
            >
                <GlassFilter
                    id={filterId}
                    borderRadius={999}
                    brightness={55}
                    blur={8}
                    opacity={0.9}
                    distortionScale={-120}
                    fillColor={hovered ? ITEM_GLASS_FILL_HOVERED : ITEM_GLASS_FILL}
                />

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
                        backdropFilter:       ITEM_BACKDROP_FILTER(filterId),
                        WebkitBackdropFilter: ITEM_BACKDROP_FILTER(filterId),
                        background: hovered
                            ? `linear-gradient(145deg,
                                rgba(255,255,255,0.30) 0%,
                                rgba(255,255,255,0.17) 38%,
                                rgba(255,255,255,0.09) 100%
                              )`
                            : `linear-gradient(145deg,
                                rgba(255,255,255,0.20) 0%,
                                rgba(255,255,255,0.11) 42%,
                                rgba(255,255,255,0.055) 100%
                              )`,
                        boxShadow:    shellShadow,
                        transition:   "background 0.25s ease, box-shadow 0.25s ease",
                    }}
                >
                    <GlassHighlights />

                    <div style={{
                        position: "relative", zIndex: 2,
                        width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color:      hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.78)",
                        transition: "color 0.2s",
                    }}>
                        {children}
                    </div>
                </motion.div>
            </motion.div>

            {/* Tooltip — absolute, centered under bubble */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0,  scale: 1    }}
                        exit   ={{ opacity: 0, y: -2, scale: 0.9  }}
                        transition={{ duration: 0.15 }}
                        style={{
                            ...TOOLTIP_STYLE,
                            position:  "absolute",
                            top:       "calc(100% + 10px)",
                            left:      "50%",
                            transform: "translateX(-50%)",
                        }}
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
