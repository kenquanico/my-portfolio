import { useState, useRef } from "react";
import { motion } from "framer-motion";
import LiquidEther from "./LiquidEther.tsx";
import { LiquidGlassDock } from "./dock/LiquidGlassDock";
import { GlassFilter } from "./dock/GlassFilter.tsx";
import Logo from "../assets/kenldry.svg";
import profilePhoto from "../assets/s2.jpg";

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

let _glassId = 0;
function useGlassId() {
    const ref = useRef<string | null>(null);
    if (!ref.current) ref.current = `glass-${_glassId++}`;
    return ref.current;
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

const TECH_STACK: { name: string; svg: React.ReactNode }[] = [
    {
        name: "React",
        svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" width={S} height={S}>
                <circle cx="12" cy="12" r="2.05" fill="white" stroke="none"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1" transform="rotate(60 12 12)"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1" transform="rotate(120 12 12)"/>
            </svg>
        ),
    },
    {
        name: "React Native",
        svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" width={S} height={S}>
                <circle cx="12" cy="12" r="2.05" fill="white" stroke="none"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1" transform="rotate(60 12 12)"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1" transform="rotate(120 12 12)"/>
                <rect x="8" y="18.5" width="8" height="1.4" rx="0.7" fill="white" stroke="none"/>
            </svg>
        ),
    },
    {
        name: "Laravel",
        svg: (
            <svg viewBox="0 0 24 24" fill="white" width={S} height={S}>
                <path fillRule="evenodd" clipRule="evenodd" d="M23.066 4.345a.454.454 0 0 1 .008.452l-3.056 5.537a.455.455 0 0 1-.39.226h-3.813l-1.785 3.094v.005l-1.83 3.17-1.786 3.093a.455.455 0 0 1-.39.226H6.207a.455.455 0 0 1-.394-.682l1.577-2.73h-3.11a.455.455 0 0 1-.39-.683l1.577-2.731H2.22a.455.455 0 0 1-.394-.682L4.881 7.64a.455.455 0 0 1 .394-.226h3.808l1.627-2.818a.455.455 0 0 1 .394-.227h11.572c.162 0 .312.087.39.226v-.25zM10.48 8.323H6.944L5.367 11.05h3.536l1.577-2.727zm-2.758 3.636H4.186l-1.577 2.727h3.537l1.577-2.727zm4.34-7.273h-3.535L6.95 7.413h3.535l1.577-2.727zm5.66 4.773-1.577-2.727h-3.762L10.806 9.5l-1.577 2.727 1.786 3.094 1.785 3.093h.002l3.028-5.224 1.892-3.131zm1.83-3.182h-3.536l1.577 2.727h3.537l-1.577-2.727zm-3.3 3.637-1.302 2.25 1.3 2.25h2.605l1.3-2.25-1.3-2.25h-2.604z"/>
            </svg>
        ),
    },
    {
        name: "TypeScript",
        svg: (
            <svg viewBox="0 0 24 24" fill="white" width={S} height={S}>
                <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
            </svg>
        ),
    },
    {
        name: "Java",
        svg: (
            <svg viewBox="0 0 24 24" fill="white" width={S} height={S}>
                <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.749-.890 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.700 14.977-1.820M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639"/>
            </svg>
        ),
    },
    {
        name: "C#",
        svg: (
            <svg viewBox="0 0 24 24" fill="white" width={S} height={S}>
                <path d="M1.194 7.543v8.913c0 1.103.588 2.122 1.544 2.674l7.718 4.456c.955.552 2.131.552 3.087 0l7.718-4.456a3.088 3.088 0 0 0 1.544-2.674V7.543a3.088 3.088 0 0 0-1.544-2.674L13.543.413a3.085 3.085 0 0 0-3.087 0L2.738 4.869a3.088 3.088 0 0 0-1.544 2.674Zm11.543 1.196a3.19 3.19 0 0 0-1.605.43 3.22 3.22 0 0 0-1.17 1.17 3.185 3.185 0 0 0 0 3.221 3.22 3.22 0 0 0 1.17 1.17c.497.285 1.046.43 1.605.43.559 0 1.108-.145 1.605-.43a3.22 3.22 0 0 0 1.17-1.17l1.765 1.02a5.4 5.4 0 0 1-1.963 1.963 5.412 5.412 0 0 1-5.41 0 5.412 5.412 0 0 1-1.963-1.963 5.41 5.41 0 0 1 0-5.41 5.412 5.412 0 0 1 1.963-1.963 5.412 5.412 0 0 1 5.41 0 5.4 5.4 0 0 1 1.963 1.963l-1.765 1.02a3.22 3.22 0 0 0-1.17-1.17 3.19 3.19 0 0 0-1.605-.301Zm5.21 1.96h.832v-.83h.777v.83h.833v.777h-.833v.831h-.777v-.831h-.832Zm2.499 0h.832v-.83h.778v.83h.832v.777h-.832v.831h-.778v-.831h-.832Z"/>
            </svg>
        ),
    },
    {
        name: "Tailwind CSS",
        svg: (
            <svg viewBox="0 0 24 24" fill="white" width={S} height={S}>
                <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
            </svg>
        ),
    },
    {
        name: "Figma",
        svg: (
            <svg viewBox="0 0 24 24" fill="white" width={S} height={S}>
                <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.678 1.349 3.019 3.044 3.019 1.65 0 3.093-1.349 3.093-3.019v-3.02H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.099c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.491 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-.098z"/>
            </svg>
        ),
    },
    {
        name: "Node.js",
        svg: (
            <svg viewBox="0 0 24 24" fill="white" width={S} height={S}>
                <path d="M11.998 24a1.55 1.55 0 0 1-.778-.21l-2.48-1.47c-.37-.207-.19-.28-.067-.323.494-.172.593-.21 1.118-.508.055-.032.128-.02.184.013l1.906 1.132c.07.038.166.038.228 0l7.436-4.29c.07-.04.114-.12.114-.204V5.862c0-.085-.044-.166-.116-.21l-7.434-4.287a.222.222 0 0 0-.226 0L4.45 5.65a.24.24 0 0 0-.118.212v8.578c0 .086.045.163.116.207l2.037 1.175c1.106.553 1.783-.098 1.783-.752V6.762c0-.12.096-.214.217-.214h.946c.118 0 .215.094.215.214v8.308c0 1.473-.803 2.318-2.2 2.318-.43 0-.768 0-1.713-.465L3.6 15.788a1.567 1.567 0 0 1-.778-1.358V5.853c0-.56.298-1.08.778-1.358l7.44-4.293a1.622 1.622 0 0 1 1.558 0l7.44 4.293c.48.278.778.8.778 1.358v8.578c0 .56-.298 1.082-.778 1.36l-7.44 4.29a1.55 1.55 0 0 1-.6.219zm2.296-5.9c-3.257 0-3.94-1.496-3.94-2.752 0-.12.097-.214.217-.214h.965c.107 0 .197.078.214.183.146.984.582 1.48 2.546 1.48 1.567 0 2.233-.354 2.233-1.185 0-.48-.188-.836-2.626-1.074-2.037-.202-3.297-.65-3.297-2.278 0-1.5 1.264-2.394 3.383-2.394 2.38 0 3.558.826 3.703 2.598a.214.214 0 0 1-.056.162.214.214 0 0 1-.157.07h-.97a.216.216 0 0 1-.208-.168c-.232-1.027-.797-1.357-2.313-1.357-1.703 0-1.9.594-1.9 1.038 0 .54.234.697 2.546.998 2.29.3 3.373.72 3.373 2.34-.003 1.625-1.355 2.553-3.716 2.553z"/>
            </svg>
        ),
    },
];

const MARQUEE_ITEMS = [...TECH_STACK, ...TECH_STACK];

// ─── Services data ────────────────────────────────────────────────────────────
const SERVICES = [
    {
        icon: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
        title: "Web Development",
        desc: "Full-stack web apps with React, Laravel, and TypeScript. Clean architecture, pixel-perfect UI.",
        accent: "#efeb51",
    },
    {
        icon: "M12 18.5A6.5 6.5 0 1 0 5.5 12M12 18.5V22M8 22h8",
        title: "Mobile Apps",
        desc: "Cross-platform mobile experiences with React Native. Smooth, native-feeling interfaces.",
        accent: "#a78bfa",
    },
    {
        icon: "M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586",
        title: "Visual Design",
        desc: "Brand identities, graphics, and UI design in Photoshop, Illustrator, Figma, and Canva.",
        accent: "#498dd6",
    },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AboutMe({
                                    onNavigateHome,
                                    onNavigateToProjects,
                                }: {
    onNavigateHome: () => void;
    onNavigateToProjects: () => void;
}) {
    const dockItems = [
        // AboutMe.tsx — fixed
        { icon: <Ico path={ICONS.user} />,  label: "About",   onClick: () => {} },
        { icon: <Ico path={ICONS.work} />,  label: "Work",    onClick: onNavigateToProjects },  // ← was () => {}
        { icon: <Ico path={ICONS.mail} />,  label: "Contact", onClick: onNavigateHome },
        { icon: <GitHubIcon />,             label: "GitHub",  onClick: () => {} },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
            <style>{GLOBAL_CSS}</style>

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

            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "20px 56px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <img src={Logo} alt="Logo" onClick={onNavigateHome} style={{ height: 42, width: "auto", cursor: "pointer" }} />
                <LiquidGlassDock items={dockItems} />
            </nav>

            {/* ══ SECTION 1 ══ */}
            <section style={{
                position: "relative", zIndex: 10,
                minHeight: "100vh",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "120px 56px 80px",
                maxWidth: 1280, margin: "0 auto",
            }}>
                <div style={{
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
                                {[["4+", "Years"], ["20+", "Projects"], ["50k+", "Users"]].map(([v, l], i, arr) => (
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
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                        {SERVICES.map((s, i) => (
                            <ServiceCard key={s.title} service={s} delay={0.55 + i * 0.1} />
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ══ SECTION 2 — Tech Stack Marquee ══ */}
            <section style={{ position: "relative", zIndex: 10, paddingBottom: 120 }}>
                <div style={{ paddingTop: 80 }}>
                    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px", marginBottom: 56 }}>
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
                    <div style={{ maxWidth: 1280, margin: "60px auto 0", padding: "0 56px" }}>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}
                        >
                            {[
                                { cat: "Frontend", items: ["React", "React Native", "TypeScript", "Tailwind CSS"], accent: "#efeb51", icon: "M16 18l6-6-6-6 M8 6l-6 6 6 6" },
                                { cat: "Backend",  items: ["Laravel", "Java", "C#", "Node.js"],                   accent: "#a78bfa", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
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