import { useEffect, useRef } from "react";

type GlassFilterProps = {
    id: string;
    borderRadius?: number;
    blur?: number;
    brightness?: number;
    opacity?: number;
    distortionScale?: number;
    fillColor?: string;
    turbulenceFreq?: string;
    turbulenceSeed?: number;
};

function svgDataUri(svg: string) {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function GlassFilter({
                                id,
                                borderRadius = 999,
                                blur = 6,
                                brightness = 52,
                                opacity = 0.72,
                                distortionScale = -260,
                                fillColor = "rgba(118,104,178,0.07)",
                                turbulenceFreq = "0.012 0.018",
                                turbulenceSeed = 7,
                            }: GlassFilterProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const mapRef = useRef<SVGFEImageElement>(null);

    useEffect(() => {
        const buildMap = () => {
            const host = svgRef.current?.closest("[data-glass-host]");
            const rect = host?.getBoundingClientRect() ?? { width: 420, height: 76 };
            const width = Math.max(1, rect.width || 420);
            const height = Math.max(1, rect.height || 76);
            const edge = Math.max(5, Math.min(width, height) * 0.12);
            const rx = Math.min(borderRadius, height / 2);

            return svgDataUri(`
<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="soft">
      <feGaussianBlur stdDeviation="${Math.max(2, edge * 0.28)}"/>
    </filter>
    <linearGradient id="xLens" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgb(28,128,128)"/>
      <stop offset="12%" stop-color="rgb(255,128,128)"/>
      <stop offset="31%" stop-color="rgb(110,128,128)"/>
      <stop offset="50%" stop-color="rgb(128,128,128)"/>
      <stop offset="69%" stop-color="rgb(146,128,128)"/>
      <stop offset="88%" stop-color="rgb(0,128,128)"/>
      <stop offset="100%" stop-color="rgb(228,128,128)"/>
    </linearGradient>
    <linearGradient id="yLens" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgb(128,255,128)"/>
      <stop offset="18%" stop-color="rgb(128,112,128)"/>
      <stop offset="50%" stop-color="rgb(128,128,128)"/>
      <stop offset="82%" stop-color="rgb(128,148,128)"/>
      <stop offset="100%" stop-color="rgb(128,0,128)"/>
    </linearGradient>
    <clipPath id="pill">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${rx}"/>
    </clipPath>
  </defs>
  <rect width="${width}" height="${height}" fill="rgb(128,128,128)"/>
  <g clip-path="url(#pill)" filter="url(#soft)">
    <rect x="${edge * -0.35}" y="0" width="${width + edge * 0.7}" height="${height}" fill="url(#xLens)" opacity="0.72"/>
    <rect x="0" y="${edge * -0.35}" width="${width}" height="${height + edge * 0.7}" fill="url(#yLens)" opacity="0.58" style="mix-blend-mode:screen"/>
    <ellipse cx="${width * 0.18}" cy="${height * 0.12}" rx="${width * 0.28}" ry="${height * 0.58}" fill="rgb(250,220,150)" opacity="0.34"/>
    <ellipse cx="${width * 0.84}" cy="${height * 0.86}" rx="${width * 0.22}" ry="${height * 0.42}" fill="rgb(40,220,255)" opacity="0.20"/>
    <path d="M ${edge * 0.55} ${height * 0.52}
             C ${width * 0.22} ${height * -0.12}, ${width * 0.36} ${height * 1.16}, ${width * 0.50} ${height * 0.48}
             S ${width * 0.78} ${height * -0.08}, ${width - edge * 0.55} ${height * 0.48}"
          fill="none" stroke="rgb(255,80,128)" stroke-width="${Math.max(8, edge * 0.7)}" stroke-linecap="round" opacity="0.24"/>
    <path d="M ${edge * 0.35} ${height * 0.22}
             C ${width * 0.18} ${height * 0.86}, ${width * 0.36} ${height * 0.04}, ${width * 0.56} ${height * 0.74}
             S ${width * 0.82} ${height * 0.12}, ${width - edge * 0.35} ${height * 0.80}"
          fill="none" stroke="rgb(80,255,180)" stroke-width="${Math.max(7, edge * 0.55)}" stroke-linecap="round" opacity="0.22"/>
  </g>
</svg>`);
        };

        const updateMap = () => {
            mapRef.current?.setAttribute("href", buildMap());
        };

        updateMap();
        const host = svgRef.current?.closest("[data-glass-host]");
        if (!host) return;

        const observer = new ResizeObserver(() => window.requestAnimationFrame(updateMap));
        observer.observe(host);
        return () => observer.disconnect();
    }, [borderRadius, id]);

    const displacement = Math.max(4, Math.abs(distortionScale) * 0.115);
    const brightnessSlope = 1 + brightness * 0.0032;

    return (
        <svg
            ref={svgRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                opacity: 0,
                zIndex: -1,
            }}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <filter id={id} x="-18%" y="-36%" width="136%" height="172%" colorInterpolationFilters="sRGB">
                    <feImage
                        ref={mapRef}
                        x="-6%"
                        y="-18%"
                        width="112%"
                        height="136%"
                        preserveAspectRatio="none"
                        result="lensMap"
                    />
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency={turbulenceFreq}
                        numOctaves={4}
                        seed={turbulenceSeed}
                        stitchTiles="stitch"
                        result="liquidNoise"
                    />
                    <feColorMatrix
                        in="liquidNoise"
                        type="matrix"
                        values="
                          1.35 0    0    0 -0.18
                          0    1.28 0    0 -0.15
                          0    0    1.1  0 -0.05
                          0    0    0    1  0"
                        result="coloredNoise"
                    />
                    <feBlend in="lensMap" in2="coloredNoise" mode="overlay" result="liquidMap" />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="liquidMap"
                        scale={displacement}
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="warped"
                    />
                    <feGaussianBlur in="warped" stdDeviation={Math.max(0.35, blur * 0.16)} result="softWarp" />
                    <feComponentTransfer in="softWarp" result="brightened">
                        <feFuncR type="linear" slope={brightnessSlope} />
                        <feFuncG type="linear" slope={brightnessSlope} />
                        <feFuncB type="linear" slope={brightnessSlope} />
                    </feComponentTransfer>
                    <feFlood floodColor={fillColor} floodOpacity={opacity * 0.18} result="liquidTint" />
                    <feBlend in="liquidTint" in2="brightened" mode="screen" result="tinted" />
                    <feColorMatrix
                        in="tinted"
                        type="matrix"
                        values="
                          1.04 0    0    0 0
                          0    1.02 0    0 0
                          0    0    1.08 0 0
                          0    0    0    1 0"
                    />
                </filter>
            </defs>
        </svg>
    );
}
