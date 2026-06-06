import { useMemo } from "react";
import { WEBSITES } from "../data/portfolioAssets";
import WorkGallery from "./portfolio/WorkGallery";

const websiteIcon = (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M9 21V9" />
    </svg>
);

export default function WebsitesSection() {
    const projects = useMemo(() => WEBSITES, []);

    return (
        <WorkGallery
            id="websites"
            eyebrow="Websites"
            title="Web Design &"
            emphasizedTitle="Development"
            icon={websiteIcon}
            projects={projects}
        />
    );
}
