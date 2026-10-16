/* Google Analytics 4 measurement id for ScoreHub.
   On the Base44 preview this file is shadowed by a /ga-config.js generated at
   container start from the GA_MEASUREMENT_ID secret (docker-compose.base44.yml
   + nginx.base44.conf). On a plain static deploy analytics.js loads THIS file —
   put your GA4 measurement id below to enable tracking, e.g.
     window.SCOREHUB_GA_ID = "G-XXXXXXXXXX";
   Keep it empty to track nothing. */
window.SCOREHUB_GA_ID = "";
