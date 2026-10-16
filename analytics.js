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

/* ---------------- Google Analytics 4 ----------------
   The measurement id is deliberately not committed here. nginx generates
   /ga-config.js at container start from the GA_MEASUREMENT_ID env variable
   (docker-compose.base44.yml); on a plain static deploy the committed
   ga-config.js in the repo root is served instead — fill it in there.
   Without a valid G-… id nothing below loads, so the site tracks nothing
   until GA is configured. Preview builds (SCOREHUB_PREVIEW=1, set by
   docker-compose.base44.yml from BASE44_PREVIEW_MODE) are never tracked,
   which keeps the GA data clean of preview traffic. */

// Events fired before GA finishes configuring (a match click in the first
// instants of a page load) are queued and replayed once gtag.js is ready.
if (!window.shTrack) {
    window.__shTrackQueue = [];
    window.shTrack = function (name, params) { window.__shTrackQueue.push([name, params || {}]); };
}

function initGoogleAnalytics() {
    if (window.SCOREHUB_PREVIEW === "1" || window.__gaLoaded) return;
    window.__gaLoaded = true;
    const s = document.createElement("script");
    s.src = "ga-config.js";
    s.onerror = () => { /* GA optional — a missing/placeholder config simply disables it */ };
    s.onload = () => {
        try {
            const id = String(window.SCOREHUB_GA_ID || "").trim();
            if (!/^G-[A-Z0-9]{4,}$/i.test(id)) return;
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
            const g = document.createElement("script");
            g.async = true;
            g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
            document.head.appendChild(g);
            window.gtag("js", new Date());
            window.gtag("config", id);
            const queued = window.__shTrackQueue.splice(0);
            queued.forEach(([name, params]) => { try { window.gtag("event", name, params); } catch (e) {} });
            window.shTrack = function (name, params) { try { window.gtag("event", name, params || {}); } catch (e) {} };
        } catch (e) { /* GA is optional — never break the page for it */ }
    };
    document.head.appendChild(s);
}

initGoogleAnalytics();
