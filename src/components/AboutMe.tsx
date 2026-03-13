import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import LiquidEther from "./LiquidEther.tsx";
import { LiquidGlassDock } from "./dock/LiquidGlassDock";
import Logo from "../assets/kenldry.svg";
import profilePhoto from "../assets/s2.jpg";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Syne:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 28s linear infinite;
  }
  .marquee-track:hover {
    animation-play-state: paused;
  }
  .marquee-fade {
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
    mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  }
`;

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

// ─── Specular overlay ─────────────────────────────────────────────────────────
const SpecularOverlay = ({ hovered }: { hovered?: boolean }) => (
    <div aria-hidden style={{
        position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
        background: `radial-gradient(ellipse 70% 28% at 18% 0%, rgba(255,255,255,${hovered ? "0.36" : "0.18"}) 0%, rgba(255,255,255,0.04) 55%, transparent 100%)`,
        transition: "background 0.38s ease",
    }} />
);

// ─── Tech Stack SVG logos (B&W) ───────────────────────────────────────────────
const TECH_STACK: { name: string; svg: React.ReactNode }[] = [
    {
        name: "React",
        svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="38" height="38">
                <circle cx="12" cy="12" r="2.05" fill="currentColor" stroke="none"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1" transform="rotate(60 12 12)"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1" transform="rotate(120 12 12)"/>
            </svg>
        ),
    },
    {
        name: "React Native",
        svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="38" height="38">
                <circle cx="12" cy="12" r="2.05" fill="currentColor" stroke="none"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1" transform="rotate(60 12 12)"/>
                <ellipse cx="12" cy="12" rx="10" ry="4.2" strokeWidth="1.1" transform="rotate(120 12 12)"/>
                <rect x="8" y="18.5" width="8" height="1.4" rx="0.7" fill="currentColor" stroke="none"/>
            </svg>
        ),
    },
    {
        name: "Laravel",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="38" height="38">
                <path fillRule="evenodd" clipRule="evenodd" d="M23.066 4.345a.454.454 0 0 1 .008.452l-3.056 5.537a.455.455 0 0 1-.39.226h-3.813l-1.785 3.094v.005l-1.83 3.17-1.786 3.093a.455.455 0 0 1-.39.226H6.207a.455.455 0 0 1-.394-.682l1.577-2.73h-3.11a.455.455 0 0 1-.39-.683l1.577-2.731H2.22a.455.455 0 0 1-.394-.682L4.881 7.64a.455.455 0 0 1 .394-.226h3.808l1.627-2.818a.455.455 0 0 1 .394-.227h11.572c.162 0 .312.087.39.226v-.25zM10.48 8.323H6.944L5.367 11.05h3.536l1.577-2.727zm-2.758 3.636H4.186l-1.577 2.727h3.537l1.577-2.727zm4.34-7.273h-3.535L6.95 7.413h3.535l1.577-2.727zm5.66 4.773-1.577-2.727h-3.762L10.806 9.5l-1.577 2.727 1.786 3.094 1.785 3.093h.002l3.028-5.224 1.892-3.131zm1.83-3.182h-3.536l1.577 2.727h3.537l-1.577-2.727zm-3.3 3.637-1.302 2.25 1.3 2.25h2.605l1.3-2.25-1.3-2.25h-2.604z" opacity=".9"/>
            </svg>
        ),
    },
    {
        name: "TypeScript",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="38" height="38">
                <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" opacity=".9"/>
            </svg>
        ),
    },
    {
        name: "Java",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="38" height="38">
                <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.749-.890 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.700 14.977-1.820M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639" opacity=".9"/>
            </svg>
        ),
    },
    {
        name: "C#",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="38" height="38">
                <path d="M1.194 7.543v8.913c0 1.103.588 2.122 1.544 2.674l7.718 4.456c.955.552 2.131.552 3.087 0l7.718-4.456a3.088 3.088 0 0 0 1.544-2.674V7.543a3.088 3.088 0 0 0-1.544-2.674L13.543.413a3.085 3.085 0 0 0-3.087 0L2.738 4.869a3.088 3.088 0 0 0-1.544 2.674Zm11.543 1.196a3.19 3.19 0 0 0-1.605.43 3.22 3.22 0 0 0-1.17 1.17 3.185 3.185 0 0 0 0 3.221 3.22 3.22 0 0 0 1.17 1.17c.497.285 1.046.43 1.605.43.559 0 1.108-.145 1.605-.43a3.22 3.22 0 0 0 1.17-1.17l1.765 1.02a5.4 5.4 0 0 1-1.963 1.963 5.412 5.412 0 0 1-5.41 0 5.412 5.412 0 0 1-1.963-1.963 5.41 5.41 0 0 1 0-5.41 5.412 5.412 0 0 1 1.963-1.963 5.412 5.412 0 0 1 5.41 0 5.4 5.4 0 0 1 1.963 1.963l-1.765 1.02a3.22 3.22 0 0 0-1.17-1.17 3.19 3.19 0 0 0-1.605-.301Zm5.21 1.96h.832v-.83h.777v.83h.833v.777h-.833v.831h-.777v-.831h-.832Zm2.499 0h.832v-.83h.778v.83h.832v.777h-.832v.831h-.778v-.831h-.832Z" opacity=".9"/>
            </svg>
        ),
    },
    {
        name: "Tailwind CSS",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="38" height="38">
                <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" opacity=".9"/>
            </svg>
        ),
    },
    {
        name: "Photoshop",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="38" height="38">
                <path d="M0 4.008C0 1.794 1.794 0 4.008 0h15.984C22.206 0 24 1.794 24 4.008v15.984C24 22.206 22.206 24 19.992 24H4.008A4.008 4.008 0 0 1 0 19.992zm5.175 12.57h1.687v-3.57h1.335c.474-.006.947-.065 1.409-.176.41-.1.792-.284 1.124-.54.32-.252.575-.578.742-.949.188-.42.28-.876.271-1.336.012-.44-.074-.876-.253-1.281a2.594 2.594 0 0 0-.707-.952 3.194 3.194 0 0 0-1.09-.585 4.65 4.65 0 0 0-1.392-.2H5.175zm1.687-5.009V9.546h1.179c.27-.003.539.033.799.106.23.067.445.182.628.337.18.153.323.347.416.565.102.244.152.508.147.772.006.267-.044.532-.147.777a1.58 1.58 0 0 1-.416.576 1.878 1.878 0 0 1-.634.348 2.62 2.62 0 0 1-.811.118H6.862zm7.447 5.062c.451.011.9-.057 1.328-.2.371-.127.714-.328 1.009-.588.278-.255.494-.568.634-.916.145-.366.218-.755.215-1.148a2.52 2.52 0 0 0-.19-1.014 2.102 2.102 0 0 0-.555-.754 2.868 2.868 0 0 0-.882-.5 7.072 7.072 0 0 0-1.14-.3l-.616-.12a5.498 5.498 0 0 1-.54-.14 1.596 1.596 0 0 1-.386-.194.366.366 0 0 1-.153-.308.428.428 0 0 1 .153-.336c.063-.054.135-.095.213-.12a1.57 1.57 0 0 1 .583-.09c.257-.003.512.044.753.137.222.087.43.21.612.365l.918-1.044a3.175 3.175 0 0 0-.962-.559 3.632 3.632 0 0 0-1.316-.215 3.47 3.47 0 0 0-1.009.143 2.6 2.6 0 0 0-.822.423 2.01 2.01 0 0 0-.556.681 2.063 2.063 0 0 0-.2.913c-.02.36.06.719.231 1.038.155.272.373.503.634.676.27.18.565.317.876.406.315.093.634.172.957.236l.619.12c.208.038.412.097.608.175a1.26 1.26 0 0 1 .43.278.6.6 0 0 1 .164.44.574.574 0 0 1-.086.316.71.71 0 0 1-.232.22 1.17 1.17 0 0 1-.342.128 2.07 2.07 0 0 1-.42.04 2.6 2.6 0 0 1-.924-.164 2.985 2.985 0 0 1-.788-.468l-.948 1.087c.303.274.66.484 1.047.618.451.161.927.239 1.406.232z" opacity=".9"/>
            </svg>
        ),
    },
    {
        name: "Illustrator",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="38" height="38">
                <path d="M0 4.008C0 1.794 1.794 0 4.008 0h15.984C22.206 0 24 1.794 24 4.008v15.984C24 22.206 22.206 24 19.992 24H4.008A4.008 4.008 0 0 1 0 19.992zm12.8 2.658L8.645 16.609h1.712l.975-2.857h3.979l.975 2.857H18l-4.155-9.943zm.315 2.467h.05l1.5 4.11h-3.05zm-4.48-2.408c-.473 0-.86.387-.86.86s.387.86.86.86.86-.387.86-.86-.387-.86-.86-.86zm-.754 3.197v6.687h1.509V9.922z" opacity=".9"/>
            </svg>
        ),
    },
    {
        name: "Canva",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="38" height="38">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.52 5.5c1.91 0 3.297 1.2 3.297 2.85 0 2.1-1.634 3.5-3.872 3.5-.237 0-.476-.015-.71-.045.188.577.697.96 1.365.96.694 0 1.34-.26 1.9-.69l.775 1.285c-.78.58-1.78.92-2.88.92-2.19 0-3.75-1.5-3.75-3.56 0-2.77 2.02-5.22 3.875-5.22zm4.91 3.25c.664 0 1.063.375 1.063.973 0 .783-.667 1.313-1.657 1.313a2.4 2.4 0 0 1-.595-.073c.072.22.268.368.524.368.265 0 .515-.1.73-.265l.295.493c-.298.222-.683.353-1.104.353-.838 0-1.437-.575-1.437-1.366 0-1.063.775-1.797 1.18-1.797zm-4.91.783c-.78 0-1.78 1.187-1.78 2.9 0 .12.01.234.024.346.21.04.426.063.645.063 1.22 0 2.23-.77 2.23-1.88 0-.82-.5-1.43-1.12-1.43zm4.906.938c-.185 0-.502.373-.502.682 0 .218.143.352.36.352.212 0 .502-.194.502-.588 0-.295-.14-.446-.36-.446z" opacity=".9"/>
            </svg>
        ),
    },
    {
        name: "Figma",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="38" height="38">
                <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.678 1.349 3.019 3.044 3.019 1.65 0 3.093-1.349 3.093-3.019v-3.02H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.099c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.491 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-.098z" opacity=".9"/>
            </svg>
        ),
    },
];

// Duplicate for seamless loop
const MARQUEE_ITEMS = [...TECH_STACK, ...TECH_STACK];

// ─── What I Do cards ──────────────────────────────────────────────────────────
const SERVICES = [
    {
        icon: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
        title: "Web Development",
        desc: "Full-stack web apps with React, Laravel, and TypeScript. Clean architecture, pixel-perfect UI.",
        accent: "#efeb51",
        bg: "linear-gradient(145deg, #1a3a8a 0%, #2556c8 55%, #367bf5 100%)",
    },
    {
        icon: "M12 18.5A6.5 6.5 0 1 0 5.5 12M12 18.5V22M8 22h8",
        title: "Mobile Apps",
        desc: "Cross-platform mobile experiences with React Native. Smooth, native-feeling interfaces.",
        accent: "#a78bfa",
        bg: "linear-gradient(145deg, #1a0a3a 0%, #2d1560 55%, #4a1fb5 100%)",
    },
    {
        icon: "M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586",
        title: "Visual Design",
        desc: "Brand identities, graphics, and UI design in Photoshop, Illustrator, Figma, and Canva.",
        accent: "#498dd6",
        bg: "linear-gradient(145deg, #020d1a 0%, #051525 55%, #081d34 100%)",
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
        { icon: <Ico path={ICONS.user} />, label: "About",   onClick: () => {} },
        { icon: <Ico path={ICONS.work} />, label: "Work",    onClick: onNavigateToProjects },
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
                <img src={Logo} alt="Logo" style={{ height: 42, width: "auto" }} />
                <LiquidGlassDock items={dockItems} />
            </nav>

            {/* ══════════════════════════════════════════════
          SECTION 1 — Profile + About + What I Do
      ══════════════════════════════════════════════ */}
            <section style={{
                position: "relative", zIndex: 10,
                minHeight: "100vh",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "120px 56px 80px",
                maxWidth: 1280, margin: "0 auto",
            }}>

                {/* ── Row 1: Profile + About Me ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1px 1.4fr",
                    gap: "0 60px",
                    alignItems: "center",
                    marginBottom: 80,
                }}>

                    {/* LEFT — Profile */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
                    >
                        {/* Avatar */}
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
                            <img
                                src={profilePhoto}
                                alt="Ken Aldrey"
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
                        </div>

                        {/* Name + title */}
                        <div style={{ textAlign: "center" }}>
                            <h1 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(26px, 2.6vw, 36px)",
                                fontWeight: 300, letterSpacing: "-0.02em",
                                color: "#fff", lineHeight: 1.1, marginBottom: 8,
                            }}>Ken Aldrey Quanico</h1>
                            <p style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "11px",
                                fontWeight: 500, letterSpacing: "0.26em",
                                textTransform: "uppercase", color: "rgba(160,145,200,0.65)",
                            }}>Designer & Developer</p>
                        </div>

                        {/* Stats row */}
                        <div style={{
                            display: "flex", gap: 0, width: "100%",
                            padding: "18px 20px", borderRadius: 14,
                            background: "rgba(16,12,32,0.85)",
                            border: "1px solid rgba(99,89,133,0.2)",
                        }}>
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
                                        fontFamily: "'Syne', sans-serif", fontSize: "9px",
                                        fontWeight: 500, letterSpacing: "0.2em",
                                        textTransform: "uppercase", color: "rgba(160,145,200,0.55)",
                                    }}>{l}</p>
                                </div>
                            ))}
                        </div>

                        {/* Status pill */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 18px", borderRadius: 999,
                            background: "rgba(16,12,32,0.9)",
                            border: "1px solid rgba(99,89,133,0.3)",
                        }}>
                            <div style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: "#4ade80",
                                boxShadow: "0 0 8px #4ade80, 0 0 16px rgba(74,222,128,0.4)",
                            }} />
                            <span style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "10px",
                                fontWeight: 500, letterSpacing: "0.18em",
                                textTransform: "uppercase", color: "rgba(160,145,200,0.7)",
                            }}>Available for work</span>
                        </div>
                    </motion.div>

                    {/* CENTER DIVIDER */}
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            width: "1px", alignSelf: "stretch", minHeight: 400,
                            background: "linear-gradient(180deg, transparent 0%, rgba(99,89,133,0.32) 18%, rgba(99,89,133,0.32) 82%, transparent 100%)",
                            transformOrigin: "top center",
                        }}
                    />

                    {/* RIGHT — About Me */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ display: "flex", flexDirection: "column", gap: 24 }}
                    >
                        <div>
                            <p style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500,
                                letterSpacing: "0.32em", textTransform: "uppercase",
                                color: "rgba(160,145,200,0.6)", marginBottom: 14,
                            }}>About Me</p>
                            <h2 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(30px, 3vw, 46px)",
                                fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.025em",
                                color: "#fff", marginBottom: 22,
                            }}>
                                Crafting{" "}
                                <em style={{ color: "rgba(160,145,200,0.8)", fontStyle: "italic" }}>digital worlds</em>
                                <br />that feel alive.
                            </h2>
                            <p style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "clamp(14px, 1.35vw, 16px)",
                                fontWeight: 300, lineHeight: 1.8,
                                color: "rgba(196,182,228,0.75)", marginBottom: 16,
                            }}>
                                I'm a designer and developer obsessed with interfaces that feel physical — that respond, breathe, and delight. I work at the intersection of visual identity, motion, and engineering.
                            </p>
                            <p style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "clamp(14px, 1.35vw, 16px)",
                                fontWeight: 300, lineHeight: 1.8,
                                color: "rgba(196,182,228,0.75)", marginBottom: 16,
                            }}>
                                Based in the Philippines, I've shipped products used by thousands — from headless CMS platforms to spatial mobile apps. Every pixel is intentional, every interaction considered.
                            </p>
                            <p style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "clamp(14px, 1.35vw, 16px)",
                                fontWeight: 300, lineHeight: 1.8,
                                color: "rgba(196,182,228,0.75)",
                            }}>
                                When I'm not building, I'm studying design systems, experimenting with motion, and pushing the limits of what the web can feel like.
                            </p>
                        </div>

                        {/* Quick facts */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
                        }}>
                            {[
                                ["📍", "Philippines"],
                                ["🎓", "BS Information Technology"],
                                ["💼", "Freelance & Open to Roles"],
                                ["🌐", "Filipino & English"],
                            ].map(([icon, text]) => (
                                <div key={text} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "12px 16px", borderRadius: 10,
                                    background: "rgba(16,12,32,0.7)",
                                    border: "1px solid rgba(99,89,133,0.18)",
                                }}>
                                    <span style={{ fontSize: 14 }}>{icon}</span>
                                    <span style={{
                                        fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
                                        fontWeight: 300, color: "rgba(196,182,228,0.8)",
                                    }}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ── Row 2: What I Do ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
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

            {/* ══════════════════════════════════════════════
          SECTION 2 — Tech Stack Marquee
      ══════════════════════════════════════════════ */}
            <section style={{
                position: "relative", zIndex: 10,
                paddingBottom: 120,
            }}>
                {/* Dark fade-in */}
                <div style={{
                    background: "linear-gradient(180deg, transparent 0px, rgba(5,3,15,0.95) 80px)",
                    paddingTop: 80,
                }}>
                    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px", marginBottom: 56 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ textAlign: "center", marginBottom: 16 }}
                        >
                            <p style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "10px", fontWeight: 500,
                                letterSpacing: "0.32em", textTransform: "uppercase",
                                color: "rgba(160,145,200,0.6)", marginBottom: 12,
                            }}>Tech Stack & Software</p>
                            <h2 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(28px, 3vw, 44px)",
                                fontWeight: 300, letterSpacing: "-0.025em",
                                color: "#fff", lineHeight: 1.1, marginBottom: 12,
                            }}>
                                Tools I{" "}
                                <em style={{ color: "rgba(160,145,200,0.8)", fontStyle: "italic" }}>work with</em>
                            </h2>
                            <div style={{ width: 48, height: 1, margin: "0 auto", background: "linear-gradient(90deg, transparent, rgba(160,145,200,0.45), transparent)" }} />
                        </motion.div>
                    </div>

                    {/* Marquee strip */}
                    <div style={{
                        position: "relative",
                        overflow: "hidden",
                        padding: "32px 0",
                        borderTop: "1px solid rgba(99,89,133,0.15)",
                        borderBottom: "1px solid rgba(99,89,133,0.15)",
                        background: "rgba(8,5,20,0.7)",
                    }}
                         className="marquee-fade"
                    >
                        <div className="marquee-track">
                            {MARQUEE_ITEMS.map((tech, i) => (
                                <MarqueeItem key={`${tech.name}-${i}`} tech={tech} />
                            ))}
                        </div>
                    </div>

                    {/* Category pills */}
                    <div style={{ maxWidth: 1280, margin: "60px auto 0", padding: "0 56px" }}>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 20,
                            }}
                        >
                            {[
                                {
                                    cat: "Frontend",
                                    items: ["React", "React Native", "TypeScript", "Tailwind CSS"],
                                    accent: "#efeb51",
                                    icon: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
                                },
                                {
                                    cat: "Backend",
                                    items: ["Laravel", "Java", "C#", "Node.js"],
                                    accent: "#a78bfa",
                                    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
                                },
                                {
                                    cat: "Design",
                                    items: ["Figma", "Photoshop", "Illustrator", "Canva"],
                                    accent: "#498dd6",
                                    icon: "M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z",
                                },
                            ].map((group) => (
                                <StackGroup key={group.cat} group={group} />
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
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                borderRadius: 20,
                padding: "28px 28px 24px",
                background: service.bg,
                border: `1px solid ${hovered ? service.accent + "55" : "rgba(255,255,255,0.07)"}`,
                boxShadow: hovered
                    ? `0 24px 64px rgba(0,0,0,0.7), 0 0 40px ${service.accent}10`
                    : "0 8px 32px rgba(0,0,0,0.5)",
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                cursor: "default",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <SpecularOverlay hovered={hovered} />
            <div aria-hidden style={{
                position: "absolute", inset: 0, borderRadius: "inherit",
                backgroundImage: `radial-gradient(circle, ${service.accent}0a 1.5px, transparent 1.5px)`,
                backgroundSize: "24px 24px",
                opacity: hovered ? 0.9 : 0.5,
                transition: "opacity 0.35s",
                pointerEvents: "none",
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
                fontSize: "clamp(18px, 1.8vw, 22px)",
                fontWeight: 300, letterSpacing: "-0.015em",
                color: service.accent, marginBottom: 10,
                position: "relative",
            }}>{service.title}</h3>
            <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(13px, 1.2vw, 14px)",
                fontWeight: 300, lineHeight: 1.7,
                color: "rgba(196,182,228,0.7)",
                position: "relative",
            }}>{service.desc}</p>
        </motion.div>
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
                justifyContent: "center", gap: 10,
                width: 110, flexShrink: 0,
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
                fontFamily: "'Syne', sans-serif", fontSize: "9px",
                fontWeight: 500, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "rgba(160,145,200,0.65)",
                textAlign: "center",
            }}>{tech.name}</span>
        </div>
    );
}

// ─── Stack Group Card ─────────────────────────────────────────────────────────
function StackGroup({ group }: { group: { cat: string; items: string[]; accent: string; icon: string } }) {
    return (
        <div style={{
            borderRadius: 16, padding: "24px 24px 20px",
            background: "rgba(12,8,28,0.85)",
            border: "1px solid rgba(99,89,133,0.2)",
        }}>
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
                    fontFamily: "'Syne', sans-serif", fontSize: "10px",
                    fontWeight: 500, letterSpacing: "0.24em",
                    textTransform: "uppercase", color: `${group.accent}cc`,
                }}>{group.cat}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {group.items.map(item => (
                    <span key={item} style={{
                        padding: "5px 13px", borderRadius: 999,
                        background: "rgba(22,18,44,0.9)",
                        border: "1px solid rgba(99,89,133,0.22)",
                        fontFamily: "'Syne', sans-serif", fontSize: "10px",
                        fontWeight: 500, letterSpacing: "0.1em",
                        textTransform: "uppercase", color: "rgba(210,198,235,0.72)",
                    }}>{item}</span>
                ))}
            </div>
        </div>
    );
}