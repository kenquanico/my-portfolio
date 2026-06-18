import { GRAPHICS } from "../data/graphicAssets";
import WorkGallery from "./portfolio/WorkGallery";

const graphicsIcon = (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
    </svg>
);

export default function GraphicsSection() {
    return (
        <WorkGallery
            id="graphics"
            eyebrow="Graphics"
            title="Visual Identity &"
            emphasizedTitle="Print"
            icon={graphicsIcon}
            projects={GRAPHICS}
        />
    );
}
