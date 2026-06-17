import { useRef, useEffect, useState, useCallback } from "react";

export function LiquidGlass({
                                variant = "regular",
                                borderRadius = 24,
                                depth = 0,
                                interactive = false,
                                lightSpill,
                                dimmingOpacity = 0.25,
                                className,
                                style,
                                children,
                            }: {
    variant?: "regular" | "clear";
    borderRadius?: number;
    depth?: number;
    interactive?: boolean;
    lightSpill?: string;
    dimmingOpacity?: number;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const timeRef = useRef(0);
    const [hovering, setHovering] = useState(false);
    const [pressing, setPressing] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    const d = Math.max(0, Math.min(1, depth));
    const blur = 16 + d * 16;
    const saturation = 160 + d * 40;
    const brightness = variant === "clear" ? 1 : 1.08 + d * 0.06;

    useEffect(() => {
        const mq = matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
        mq.addEventListener("change", (e) => setReducedMotion(e.matches));
        return () => mq.removeEventListener("change", (e) => setReducedMotion(e.matches));
    }, []);

    const drawRefraction = useCallback(() => {
        const canvas = canvasRef.current;
        const host = hostRef.current;
        if (!canvas || !host) return;

        const w = host.offsetWidth;
        const h = host.offsetHeight;
        if (!w || !h) return;

        if (canvas.width !== w) canvas.width = w;
        if (canvas.height !== h) canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, w, h);

        const r = Math.min(borderRadius, Math.min(w, h) / 2);
        const t = timeRef.current * 0.012;

        ctx.save();
        roundedRect(ctx, 0, 0, w, h, r);
        ctx.clip();

        const chromaScale = 0.06 + d * 0.08;
        const redGrad = ctx.createLinearGradient(0, 0, w * 0.35, 0);
        redGrad.addColorStop(0, `rgba(255,50,50,${chromaScale + 0.02 * Math.sin(t)})`);
        redGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = redGrad;
        ctx.fillRect(0, 0, w, h);

        const blueGrad = ctx.createLinearGradient(w, 0, w * 0.65, 0);
        blueGrad.addColorStop(0, `rgba(50,80,255,${chromaScale + 0.02 * Math.cos(t)})`);
        blueGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = blueGrad;
        ctx.fillRect(0, 0, w, h);

        const rimGrad = ctx.createLinearGradient(w * 0.1, 0, w * 0.9, 0);
        rimGrad.addColorStop(0, "rgba(255,255,255,0)");
        rimGrad.addColorStop(0.5, `rgba(255,255,255,${0.55 + d * 0.1})`);
        rimGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = rimGrad;
        ctx.fillRect(0, 0, w, 1.5);

        if (lightSpill) {
            const spillGrad = ctx.createRadialGradient(w * 0.3, 0, 0, w * 0.3, h * 0.5, Math.max(w, h) * 0.8);
            spillGrad.addColorStop(0, lightSpill);
            spillGrad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = spillGrad;
            ctx.fillRect(0, 0, w, h);
        }

        if (interactive && (hovering || pressing)) {
            const glowOpacity = pressing ? 0.22 : 0.12;
            const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
            glowGrad.addColorStop(0, `rgba(255,255,255,${glowOpacity})`);
            glowGrad.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = glowGrad;
            ctx.fillRect(0, 0, w, h);
        }

        ctx.restore();

        if (!reducedMotion) {
            timeRef.current++;
            animRef.current = requestAnimationFrame(drawRefraction);
        }
    }, [d, borderRadius, hovering, pressing, lightSpill, interactive, reducedMotion]);

    useEffect(() => {
        cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(drawRefraction);
        return () => cancelAnimationFrame(animRef.current);
    }, [drawRefraction]);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(animRef.current);
            animRef.current = requestAnimationFrame(drawRefraction);
        });
        ro.observe(host);
        return () => ro.disconnect();
    }, [drawRefraction]);

    const tintOpacity =
        variant === "clear"
            ? 0
            : hovering
                ? 0.14
                : pressing
                    ? 0.2
                    : 0.08 + d * 0.06;

    const shadowDepth = 0.08 + d * 0.18;

    return (
        <div
            ref={hostRef}
            className={className}
            style={{
                position: "relative",
                borderRadius,
                overflow: "hidden",
                cursor: interactive ? "pointer" : undefined,
                ...style,
            }}
            onMouseEnter={interactive ? () => setHovering(true) : undefined}
            onMouseLeave={interactive ? () => { setHovering(false); setPressing(false); } : undefined}
            onMouseDown={interactive ? () => setPressing(true) : undefined}
            onMouseUp={interactive ? () => setPressing(false) : undefined}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius,
                    backdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(${brightness})`,
                    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(${brightness})`,
                }}
            />

            {variant === "clear" && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius,
                        background: `rgba(0,0,0,${dimmingOpacity})`,
                    }}
                />
            )}

            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius,
                    background: `rgba(255,255,255,${tintOpacity})`,
                    transition: "background 0.15s ease",
                }}
            />

            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius,
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius,
                    border: "1px solid rgba(255,255,255,0.25)",
                    boxShadow: [
                        `0 ${4 + d * 20}px ${16 + d * 40}px rgba(0,0,0,${shadowDepth})`,
                        `inset 0 -1px 0 rgba(0,0,0,${0.06 + d * 0.08})`,
                    ].join(", "),
                    pointerEvents: "none",
                }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
}

function roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
