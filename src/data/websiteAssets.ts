import {
    allowedDemoExtensions,
    buildAssets,
    buildPosterMap,
} from "./portfolioAssetUtils";

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

export const WEBSITES = buildAssets(
    demoModules,
    "Demo",
    "Web and mobile interface demo",
    "Playable portfolio demo loaded directly from the web and mobile demo assets folder.",
    allowedDemoExtensions,
    buildPosterMap(demoPosterModules),
);
