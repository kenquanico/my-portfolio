import { lazy, Suspense, useEffect, useState } from "react";
import type { LiquidEtherProps } from "./LiquidEther";

const LiquidEther = lazy(() => import("./LiquidEther"));

export default function DeferredLiquidEther(props: LiquidEtherProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let timeoutId = 0;
        let idleId = 0;
        const load = () => setReady(true);

        if ("requestIdleCallback" in window) {
            idleId = window.requestIdleCallback(load, { timeout: 1200 });
        } else {
            timeoutId = globalThis.setTimeout(load, 650);
        }

        return () => {
            if (idleId) window.cancelIdleCallback(idleId);
            if (timeoutId) globalThis.clearTimeout(timeoutId);
        };
    }, []);

    if (!ready) return null;

    return (
        <Suspense fallback={null}>
            <LiquidEther {...props} />
        </Suspense>
    );
}
