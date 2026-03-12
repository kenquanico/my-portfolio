import { useRef, useEffect } from "react";

/**
 * GlassFilter
 * Renders an invisible SVG <filter> that applies chromatic-aberration
 * displacement to whatever element references it via:
 *   backdropFilter: `url(#${id}) blur(0.5px) saturate(140%)`
 *
 * The host element must have [data-glass-host] so the ResizeObserver
 * can re-generate the displacement map when the element resizes.
 */
export function GlassFilter({
                                id,
                                borderRadius   = 999,
                                brightness     = 52,
                                blur           = 10,
                                opacity        = 0.88,
                                distortionScale = -160,
                            }) {
    const containerRef = useRef(null);
    const feImageRef   = useRef(null);
    const redRef       = useRef(null);
    const greenRef     = useRef(null);
    const blueRef      = useRef(null);

    const redGradId  = `${id}-rg`;
    const blueGradId = `${id}-bg`;

    // ── Build displacement map ──────────────────────────────────────────
    const buildMap = () => {
        const host = containerRef.current?.closest("[data-glass-host]");
        const rect = host?.getBoundingClientRect() ?? { width: 400, height: 80 };
        const w    = rect.width  || 400;
        const h    = rect.height || 80;
        const edge = Math.min(w, h) * 0.035;

        return `data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%"   stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="black"/>
        <rect width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${redGradId})"/>
        <rect width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${blueGradId})"
              style="mix-blend-mode:difference"/>
        <rect x="${edge}" y="${edge}"
              width="${w - edge * 2}" height="${h - edge * 2}"
              rx="${borderRadius}"
              fill="hsl(0 0% ${brightness}% / ${opacity})"
              style="filter:blur(${blur}px)"/>
      </svg>
    `)}`;


    };

    // ── Apply map + channel scales ──────────────────────────────────────
    const update = () => {
        if (!feImageRef.current) return;
        feImageRef.current.setAttribute("href", buildMap());

        const channels = [
            [redRef,   0 ],
            [greenRef, 10],
            [blueRef,  20],
        ];
        for (const [ref, offset] of channels) {
            if (!ref.current) continue;
            ref.current.setAttribute("scale",            String(distortionScale + offset));
            ref.current.setAttribute("xChannelSelector", "R");
            ref.current.setAttribute("yChannelSelector", "G");
        }
    };

    useEffect(() => {
        update();
        const host = containerRef.current?.closest("[data-glass-host]");
        if (!host) return;
        const ro = new ResizeObserver(() => setTimeout(update, 0));
        ro.observe(host);
        return () => ro.disconnect();
    }, []);

    return (
        <svg
            ref={containerRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                pointerEvents: "none", opacity: 0, zIndex: -1 }}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <filter
                    id={id}
                    colorInterpolationFilters="sRGB"
                    x="0%" y="0%" width="100%" height="100%"
                >
                    <feImage
                        ref={feImageRef}
                        x="0" y="0" width="100%" height="100%"
                        preserveAspectRatio="none"
                        result="map"
                    />

                    {/* Red channel */}
                    <feDisplacementMap ref={redRef}   in="SourceGraphic" in2="map" result="dr" />
                    <feColorMatrix in="dr" type="matrix"
                                   values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />

                    {/* Green channel */}
                    <feDisplacementMap ref={greenRef} in="SourceGraphic" in2="map" result="dg" />
                    <feColorMatrix in="dg" type="matrix"
                                   values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />

                    {/* Blue channel */}
                    <feDisplacementMap ref={blueRef}  in="SourceGraphic" in2="map" result="db" />
                    <feColorMatrix in="db" type="matrix"
                                   values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />

                    <feBlend in="red"  in2="green" mode="screen" result="rg" />
                    <feBlend in="rg"   in2="blue"  mode="screen" result="out" />
                    <feGaussianBlur in="out" stdDeviation="0.5" />
                </filter>
            </defs>
        </svg>
    );
}