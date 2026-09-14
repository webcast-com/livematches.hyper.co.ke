/* Vercel Analytics for ScoreHub - static site.
   The SDKs are pulled from esm.sh at runtime, so the imports are dynamic:
   a static `import` failure happens before any code runs and cannot be caught,
   which made the fallback below dead code. Dynamic imports inside try/catch
   let us fall back to the classic /_vercel/insights script (already deferred
   in every page) when the CDN is unreachable. */

async function initVercelAnalytics() {
    try {
        const [{ inject }, { injectSpeedInsights }] = await Promise.all([
            import("https://esm.sh/@vercel/analytics@1.3.1"),
            import("https://esm.sh/@vercel/speed-insights@1.0.12")
        ]);
        inject();
        injectSpeedInsights();
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
}

if (typeof window !== 'undefined') {
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
}
initVercelAnalytics();
