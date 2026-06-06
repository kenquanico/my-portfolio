import { useMemo } from "react";
import { LOGOS } from "../data/portfolioAssets";
import WorkGallery from "./portfolio/WorkGallery";

const logosIcon = (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
    </svg>
);

export default function LogosSection() {
    const projects = useMemo(() => LOGOS, []);

    return (
        <WorkGallery
            id="logos"
            eyebrow="Logos"
            title="Marks, Wordmarks &"
            emphasizedTitle="Lettering"
            icon={logosIcon}
            projects={projects}
        />
    );
}
