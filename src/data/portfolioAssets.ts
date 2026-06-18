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
    carouselItems?: Array<{
        src: string;
        fileName: string;
        name: string;
    }>;
}

const imageExtensions = new Set(["jpg", "jpeg", "png", "svg", "webp", "gif", "avif"]);
const videoExtensions = new Set(["mp4", "webm", "mov"]);
const allowedGraphicExtensions = new Set([...imageExtensions]);
const allowedGalleryExtensions = new Set([...imageExtensions]);
const allowedLogoExtensions = new Set([...imageExtensions]);
const allowedDemoExtensions = new Set([...videoExtensions]);
const graphicPriority = new Map([
    ["mabdoc poster final", 0],
    ["mabpost social carousel", 1],
    ["rosian social media post", 2],
    ["titan watch", 3],
    ["seihane magazine cover page", 4],
]);
const currentYear = new Date().getFullYear().toString();
const assetCopy = new Map<string, Partial<Pick<PortfolioAsset, "tagline" | "description">>>([
    ["agri demo", {
        tagline: "Rice pest detection and geospatial alert system",
        description: "A capstone project built around YOLOv8m for rice pest detection, with geospatial alarm logging that helps people respond faster to field-level threats. It was recognized as Best Innovation at the STI West Negros University Research Colloquium.",
    }],
    ["mabdocv1 final demo", {
        tagline: "Healthcare directory platform for doctors and clinics",
        description: "MABDOCv1 is a healthcare platform for medical doctors and clinic discovery. It focuses on helping patients understand clinic profiles, schedules, HMO availability, and doctor information before they decide where to book or inquire.",
    }],
    ["prysm app demo", {
        tagline: "Predictive decision engine disguised as a daily companion",
        description: "Prysm is a predictive decision engine disguised as a daily companion app. Its philosophy is simple: the best decision is one you never had to make consciously. Every feature reduces active choices through intelligent, context-aware recommendations that feel less like AI and more like a trusted assistant who already knows you.",
    }],
    ["sti app demo", {
        tagline: "Campus app concept for everyday student workflows",
        description: "A student-focused project concept for STI WNU that brings common campus actions into a cleaner mobile experience. The goal is to make student information, updates, and daily school interactions feel easier to access and less scattered.",
    }],
    ["mabdoc poster final", {
        tagline: "Healthcare campaign visual built around trust and clarity",
        description: "A people-first medical poster designed to make healthcare information feel credible, calm, and easy to understand. The composition supports patients who need quick context without visual noise.",
    }],
    ["mabpost social carousel", {
        tagline: "MABDOC social carousel for patient-facing announcements",
        description: "A carousel set for MABDOC that turns healthcare updates into a cleaner sequence of social posts. Each frame keeps the message direct, credible, and easy to scan while staying visually connected to the medical brand.",
    }],
    ["rosian social media post", {
        tagline: "Social content designed for quick property discovery",
        description: "A real-estate social layout made for fast scanning, clear hierarchy, and buyer confidence. It turns listing details into a polished visual that feels easier for people to save, share, and act on.",
    }],
    ["titan watch", {
        tagline: "Product visual focused on premium attention",
        description: "A product-centered design that frames the watch as an object of precision and taste. The visual direction keeps the focus on material, silhouette, and the feeling of a considered purchase.",
    }],
    ["seihane magazine cover page", {
        tagline: "Editorial cover with character and atmosphere",
        description: "A magazine cover treatment shaped around personality, mood, and immediate shelf appeal. It gives the subject a stronger presence while keeping the reader's first impression clean and memorable.",
    }],
    ["20 1", {
        tagline: "Graphic layout made for high-impact visual recall",
        description: "A bold composition built to catch attention quickly and leave people with a clear visual memory. The design balances display energy with enough structure to stay readable.",
    }],
    ["ang supremo poster event", {
        tagline: "Event poster designed for civic energy and turnout",
        description: "An event visual that uses strong hierarchy and dramatic contrast to help people understand the occasion, feel its importance, and notice the call to participate.",
    }],
    ["brown trojans org shirt", {
        tagline: "Organization apparel with identity and belonging",
        description: "A shirt design made to help members feel represented as a group. The layout prioritizes team identity, wearability, and a mark that can hold up beyond a single event.",
    }],
    ["experience sbe", {
        tagline: "Experience graphic built around invitation and motion",
        description: "A promotional visual shaped to feel active and inviting. It guides people toward the event experience while keeping the design energetic, organized, and easy to read.",
    }],
    ["junior programmer s guild org shirt", {
        tagline: "Developer community apparel with a clean tech identity",
        description: "A shirt concept for a programming organization that feels modern without becoming generic. The design gives members a recognizable identity connected to craft, code, and community.",
    }],
    ["shs pubmat", {
        tagline: "Student publication material with approachable hierarchy",
        description: "A school-focused graphic made to help students and families understand the message quickly. The design keeps the information friendly, structured, and easy to share.",
    }],
    ["senior high school expo 2026", {
        tagline: "Expo visual designed for student pathways",
        description: "A promotional graphic for an academic expo that centers opportunity, direction, and student choice. It turns event information into a more welcoming path for attendees.",
    }],
    ["white athenians org shirt", {
        tagline: "Minimal organization shirt with a clean team presence",
        description: "A restrained apparel design that keeps the group's identity readable and wearable. It is built for people who want something connected to their organization without feeling overdesigned.",
    }],
    ["athenians jersey", {
        tagline: "Team jersey concept for unity and movement",
        description: "A jersey design that supports group pride and on-court visibility. The composition focuses on identity, motion, and a stronger shared presence for the team.",
    }],
    ["ctrl eat final log", {
        tagline: "Food-tech logo with a playful command-line twist",
        description: "A mark designed for people who want food ordering to feel quick, clever, and easy. The identity blends tech language with appetite in a compact, memorable form.",
    }],
    ["ethereal", {
        tagline: "Soft identity mark for an elevated visual mood",
        description: "A logo direction built around lightness, polish, and a more refined emotional tone. It gives the brand room to feel premium without becoming distant.",
    }],
    ["glamora", {
        tagline: "Salon app identity for polished beauty booking",
        description: "Glamora is a salon app identity designed to make beauty bookings feel modern, refined, and easy to trust. The mark supports a mobile-first experience where clients can discover services, book appointments, and connect with salon care in a more polished way.",
    }],
    ["mabdoc port", {
        tagline: "Healthcare identity mark for trust and access",
        description: "A medical platform logo shaped to feel clear, professional, and approachable. The goal is to support patient confidence before they ever open a clinic profile.",
    }],
    ["real estate", {
        tagline: "Property identity for confident discovery",
        description: "A real-estate mark focused on clarity and trust. It is designed to help people read the brand as stable, useful, and connected to better property decisions.",
    }],
    ["rosian ls", {
        tagline: "Real-estate visual identity with local polish",
        description: "A logo system direction for a property brand that needs to feel credible and human. The mark supports recognition across listings, profiles, and social content.",
    }],
    ["rosian realty profile", {
        tagline: "Realty profile identity for people comparing homes",
        description: "A profile-ready real-estate visual made to help buyers and renters recognize the brand quickly while browsing. It keeps the tone professional, warm, and easy to trust.",
    }],
    ["aurora 01", {
        tagline: "Atmospheric logo mark with a calm digital feel",
        description: "A visual identity mark built around softness, glow, and a memorable silhouette. It is meant for a brand that wants to feel modern, light, and emotionally approachable.",
    }],
]);

const graphicsModules = import.meta.glob("../assets/graphics/*.{jpg,jpeg,png,svg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const galleryModules = import.meta.glob("../assets/gallery/*.{jpg,jpeg,png,svg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const logoModules = import.meta.glob("../assets/logos/*.{jpg,jpeg,png,svg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

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
        const copy = assetCopy.get(priorityKey(fileName.replace(/\.[^/.]+$/, "")));

        seenSources.add(src);
        assets.push({
            id: assets.length + 1,
            name: titleFromFileName(fileName),
            year: currentYear,
            tag,
            tagline: copy?.tagline ?? tagline,
            description: copy?.description ?? description,
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

function groupMabpostCarousel(assets: PortfolioAsset[]) {
    const mabpostAssets = assets.filter((asset) => priorityKey(asset.name).startsWith("mabfb post"));
    if (!mabpostAssets.length) return assets;

    const carouselItems = mabpostAssets
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
        .map((asset) => ({
            src: asset.src,
            fileName: asset.fileName,
            name: asset.name,
        }));
    const [cover] = mabpostAssets;
    const withoutMabpost = assets.filter((asset) => !priorityKey(asset.name).startsWith("mabfb post"));

    return [
        ...withoutMabpost,
        {
            ...cover,
            name: "Mabpost Social Carousel",
            tag: "MABDOC",
            tagline: assetCopy.get("mabpost social carousel")?.tagline ?? cover.tagline,
            description: assetCopy.get("mabpost social carousel")?.description ?? cover.description,
            fileName: "mabfb_Post 1-4.png",
            carouselItems,
        },
    ];
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
    groupMabpostCarousel(buildAssets(
        graphicsModules,
        "Graphic",
        "Visual design asset",
        "Portfolio graphic loaded directly from the graphics assets folder.",
        allowedGraphicExtensions,
    ))
);

export const ABOUT_GALLERY = buildAssets(
    galleryModules,
    "Gallery",
    "Personal gallery moment",
    "A selected personal gallery image from the About Me collection.",
    allowedGalleryExtensions,
);

export const LOGOS = buildAssets(
    logoModules,
    "Logo",
    "Logo design asset",
    "Portfolio logo loaded directly from the logos assets folder.",
    allowedLogoExtensions,
);

export const ASSET_BY_SRC = new Map<string, PortfolioAsset>(
    [...WEBSITES, ...GRAPHICS, ...LOGOS, ...ABOUT_GALLERY].map((asset) => [asset.src, asset])
);
