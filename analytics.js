/* Vercel Analytics for ScoreHub - static site */
import { inject } from "https://esm.sh/@vercel/analytics@1.3.1";
import { injectSpeedInsights } from "https://esm.sh/@vercel/speed-insights@1.0.12";

try {
    inject();
    injectSpeedInsights();
    // Debug in console when loaded
    if (typeof window !== 'undefined') {
        window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
        console.log('[Analytics] Vercel Analytics injected');
    }
} catch (e) {
    console.warn('[Analytics] Failed to inject', e);
    // Fallback to classic Vercel insights script
    if (typeof document !== 'undefined') {
        const s = document.createElement('script');
        s.defer = true;
        s.src = '/_vercel/insights/script.js';
        document.head.appendChild(s);
    }
}
