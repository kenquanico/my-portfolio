export type PortfolioAssetKind = "image" | "video" | "pdf" | "other";
export type MediaOrientation = "landscape" | "portrait" | "square";

export interface MediaMetadata {
    width: number;
    height: number;
    aspectRatio: number;
    orientation: MediaOrientation;
}

export interface PortfolioAsset {
    id: number;
    name: string;
    year: string;
    tag: string;
    tagline: string;
    description: string;
    src: string;
    fileName: string;
    extension: string;
    kind: PortfolioAssetKind;
    path: string;
    posterSrc?: string;
}

const imageExtensions = new Set(["jpg", "jpeg", "png", "svg", "webp", "gif", "avif"]);
const videoExtensions = new Set(["mp4", "webm", "mov"]);
const allowedGraphicExtensions = new Set([...imageExtensions]);
const allowedLogoExtensions = new Set([...imageExtensions]);
const allowedDemoExtensions = new Set([...imageExtensions, ...videoExtensions]);
const graphicPriority = new Map([
    ["mabdoc poster final", 0],
    ["rosian social media post", 1],
    ["titan watch", 2],
    ["seihane magazine cover page", 3],
]);
const currentYear = new Date().getFullYear().toString();

const graphicsModules = import.meta.glob("../assets/graphics/*.{jpg,jpeg,png,svg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const logoModules = import.meta.glob("../assets/logos/*.{jpg,jpeg,png,svg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const demoModules = import.meta.glob("../assets/web-mobile_demo/*.{mp4,webm,mov,jpg,jpeg,png,svg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const demoPosterModules = import.meta.glob("../assets/web-mobile_demo/*.{jpg,jpeg,png,svg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

function titleFromFileName(fileName: string) {
    const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
    return withoutExtension
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extensionFromPath(path: string) {
    return path.split(".").pop()?.toLowerCase() ?? "";
}

function stemFromFileName(fileName: string) {
    return fileName.replace(/\.[^/.]+$/, "").toLowerCase();
}

function kindFromExtension(extension: string): PortfolioAssetKind {
    if (imageExtensions.has(extension)) return "image";
    if (videoExtensions.has(extension)) return "video";
    if (extension === "pdf") return "pdf";
    return "other";
}

export function getOrientation(width: number, height: number): MediaOrientation {
    if (!width || !height) return "landscape";
    const ratio = width / height;
    if (Math.abs(ratio - 1) < 0.08) return "square";
    return ratio > 1 ? "landscape" : "portrait";
}

export function createMediaMetadata(width: number, height: number): MediaMetadata {
    const safeWidth = Math.max(width, 1);
    const safeHeight = Math.max(height, 1);
    return {
        width: safeWidth,
        height: safeHeight,
        aspectRatio: safeWidth / safeHeight,
        orientation: getOrientation(safeWidth, safeHeight),
    };
}

function buildAssets(
    modules: Record<string, string>,
    tag: string,
    tagline: string,
    description: string,
    allowedExtensions: Set<string>,
    posterByStem = new Map<string, string>(),
) {
    const seenSources = new Set<string>();
    const orderedEntries = Object.entries(modules).sort(([a], [b]) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );
    const videoStems = new Set(
        orderedEntries
            .map(([path]) => path.split("/").pop() ?? "")
            .filter((fileName) => videoExtensions.has(extensionFromPath(fileName)))
            .map(stemFromFileName)
    );

    const assets: PortfolioAsset[] = [];

    for (const [path, src] of orderedEntries) {
        if (seenSources.has(src)) continue;

        const fileName = path.split("/").pop() ?? `asset-${assets.length + 1}`;
        const extension = extensionFromPath(fileName);
        if (!allowedExtensions.has(extension)) continue;
        if (imageExtensions.has(extension) && videoStems.has(stemFromFileName(fileName))) continue;

        seenSources.add(src);
        assets.push({
            id: assets.length + 1,
            name: titleFromFileName(fileName),
            year: currentYear,
            tag,
            tagline,
            description,
            src,
            fileName,
            extension,
            kind: kindFromExtension(extension),
            path,
            posterSrc: posterByStem.get(stemFromFileName(fileName)),
        });
    }

    return assets;
}

function buildPosterMap(modules: Record<string, string>) {
    return new Map(
        Object.entries(modules).map(([path, src]) => {
            const fileName = path.split("/").pop() ?? "";
            return [stemFromFileName(fileName), src] as const;
        })
    );
}

function priorityKey(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function prioritizeGraphics(assets: PortfolioAsset[]) {
    const prioritySlots: Array<PortfolioAsset | undefined> = Array.from({ length: graphicPriority.size });
    const rest: PortfolioAsset[] = [];

    for (const asset of assets) {
        const priority = graphicPriority.get(priorityKey(asset.name));
        if (priority === undefined) {
            rest.push(asset);
        } else {
            prioritySlots[priority] = asset;
        }
    }

    return [...prioritySlots.filter((asset): asset is PortfolioAsset => Boolean(asset)), ...rest].map((asset, index) => ({
        ...asset,
        id: index + 1,
    }));
}

export const WEBSITES = buildAssets(
    demoModules,
    "Demo",
    "Web and mobile interface demo",
    "Playable portfolio demo loaded directly from the web and mobile demo assets folder.",
    allowedDemoExtensions,
    buildPosterMap(demoPosterModules),
);

export const GRAPHICS = prioritizeGraphics(
    buildAssets(
        graphicsModules,
        "Graphic",
        "Visual design asset",
        "Portfolio graphic loaded directly from the graphics assets folder.",
        allowedGraphicExtensions,
    )
);

export const LOGOS = buildAssets(
    logoModules,
    "Logo",
    "Logo design asset",
    "Portfolio logo loaded directly from the logos assets folder.",
    allowedLogoExtensions,
);

export const ASSET_BY_SRC = new Map<string, PortfolioAsset>(
    [...WEBSITES, ...GRAPHICS, ...LOGOS].map((asset) => [asset.src, asset])
);
