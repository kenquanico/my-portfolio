import {
    allowedDemoExtensions,
    buildAssets,
    buildPosterMap,
    type PortfolioAsset,
} from "./portfolioAssetUtils";
import uifryPreview from "../assets/project-previews/uifry.svg";
import justHomePreview from "../assets/project-previews/justhome.svg";
import tasteNetPreview from "../assets/project-previews/tastenet.svg";

const demoModules = import.meta.glob("../assets/web-mobile_demo/*.{mp4,webm,mov}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const demoPosterModules = import.meta.glob("../assets/web-mobile_demo/*.{jpg,jpeg,webp,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const recordedWebsites = buildAssets(
    demoModules,
    "Demo",
    "Web and mobile interface demo",
    "Playable portfolio demo loaded directly from the web and mobile demo assets folder.",
    allowedDemoExtensions,
    buildPosterMap(demoPosterModules),
);

const currentYear = new Date().getFullYear().toString();

const linkedWebsites: PortfolioAsset[] = [
    {
        id: 10_001,
        name: "Uifry Finance Landing Page",
        year: currentYear,
        tag: "Live Website",
        tagline: "Bold finance app landing page for clearer product decisions",
        description: "A responsive finance product landing page with strong visual hierarchy, app-focused storytelling, feature sections, and direct conversion paths.",
        src: uifryPreview,
        previewSrc: uifryPreview,
        fileName: "uifry.svg",
        extension: "svg",
        kind: "image",
        path: "../assets/project-previews/uifry.svg",
        liveUrl: "https://uifry-one-tan.vercel.app/",
    },
    {
        id: 10_002,
        name: "JustHome Real Estate Marketplace",
        year: currentYear,
        tag: "Live Website",
        tagline: "UAE property marketplace for search, discovery, and inquiries",
        description: "A full real-estate marketplace experience with property search, location and category browsing, favorites, listings, agent discovery, and responsive navigation.",
        src: justHomePreview,
        previewSrc: justHomePreview,
        fileName: "justhome.svg",
        extension: "svg",
        kind: "image",
        path: "../assets/project-previews/justhome.svg",
        liveUrl: "https://justhome-five.vercel.app/",
    },
    {
        id: 10_003,
        name: "TasteNet Food Delivery",
        year: currentYear,
        tag: "Live Website",
        tagline: "Fast-food ordering experience with vivid product storytelling",
        description: "A responsive food-delivery landing page featuring menu discovery, promotional offers, product cards, ordering calls to action, and a bold restaurant visual system.",
        src: tasteNetPreview,
        previewSrc: tasteNetPreview,
        fileName: "tastenet.svg",
        extension: "svg",
        kind: "image",
        path: "../assets/project-previews/tastenet.svg",
        liveUrl: "https://tastenet-nine.vercel.app/",
    },
];

export const WEBSITES = [...linkedWebsites, ...recordedWebsites].map((project, index) => ({
    ...project,
    id: index + 1,
}));
