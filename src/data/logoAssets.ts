import {
    allowedLogoExtensions,
    buildAssets,
    buildPreviewMap,
} from "./portfolioAssetUtils";

const logoModules = import.meta.glob("../assets/logos/*.{jpg,jpeg,png,svg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const logoPreviewModules = import.meta.glob("../assets/previews/logos/*.{jpg,jpeg,webp,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

export const LOGOS = buildAssets(
    logoModules,
    "Logo",
    "Logo design asset",
    "Portfolio logo loaded directly from the logos assets folder.",
    allowedLogoExtensions,
    new Map(),
    buildPreviewMap(logoPreviewModules),
);
