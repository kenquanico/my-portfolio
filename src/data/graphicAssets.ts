import {
    allowedGraphicExtensions,
    buildAssets,
    buildPreviewMap,
    groupMabpostCarousel,
    prioritizeGraphics,
} from "./portfolioAssetUtils";

const graphicsModules = import.meta.glob("../assets/graphics/*.{jpg,jpeg,png,svg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const graphicPreviewModules = import.meta.glob("../assets/previews/graphics/*.{jpg,jpeg,webp,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

export const GRAPHICS = prioritizeGraphics(
    groupMabpostCarousel(buildAssets(
        graphicsModules,
        "Graphic",
        "Visual design asset",
        "Portfolio graphic loaded directly from the graphics assets folder.",
        allowedGraphicExtensions,
        new Map(),
        buildPreviewMap(graphicPreviewModules),
    ))
);
