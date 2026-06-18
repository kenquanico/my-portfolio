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

const galleryPlacement = [
    "Messenger_creation_1DEF4B90-BDE0-4AD0-817B-6DBDC787C0B0~2.jpeg",
    "Messenger_creation_08B84058-07D9-4B6F-BFC4-A41E9E9B5F4E~3.jpeg",
    "IMG_20260618_194609.jpg",
    "Messenger_creation_E9C3E6CA-FD98-49D7-997C-DE0461BE524A.jpeg",
    "received_784441994252731.jpeg",
    "received_1555921088439729~2.jpeg",
    "Screenshot 2026-06-18 at 7.34.40 PM.png",
];

function placeGalleryImages(assets: ReturnType<typeof buildAssets>) {
    const byFileName = new Map(assets.map((asset) => [asset.fileName, asset]));
    const placed = galleryPlacement
        .map((fileName) => byFileName.get(fileName))
        .filter((asset): asset is (typeof assets)[number] => Boolean(asset));
    const placedNames = new Set(placed.map((asset) => asset.fileName));
    const unplaced = assets.filter((asset) => !placedNames.has(asset.fileName));

    return [...placed, ...unplaced].map((asset, index) => ({
        ...asset,
        id: index + 1,
    }));
}

export const ABOUT_GALLERY = placeGalleryImages(
    buildAssets(
        galleryModules,
        "Gallery",
        "Personal gallery moment",
        "A selected personal gallery image from the About Me collection.",
        allowedGalleryExtensions,
        new Map(),
        buildPreviewMap(galleryPreviewModules),
    )
);
