import {
    allowedGalleryExtensions,
    buildAssets,
    buildPreviewMap,
} from "./portfolioAssetUtils";

const galleryModules = import.meta.glob("../assets/gallery/*.{jpg,jpeg,png,svg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const galleryPreviewModules = import.meta.glob("../assets/previews/gallery/*.{jpg,jpeg,webp,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

export const ABOUT_GALLERY = buildAssets(
    galleryModules,
    "Gallery",
    "Personal gallery moment",
    "A selected personal gallery image from the About Me collection.",
    allowedGalleryExtensions,
    new Map(),
    buildPreviewMap(galleryPreviewModules),
);
