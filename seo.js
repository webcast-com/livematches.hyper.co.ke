/* ScoreHub SEO utility — sets title, meta, OG, Twitter, canonical, JSON-LD dynamically for each page
   Used by match.html, preview.html, report.html, story.html, standings.html, index.html etc.
   Ensures each news, match, highlight, preview has unique SEO.
*/

(function() {
    function ensureMetaByName(name) {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            document.head.appendChild(el);
        }
        return el;
    }
    function ensureMetaByProp(prop) {
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('property', prop);
            document.head.appendChild(el);
        }
        return el;
    }
    function setTitle(title) {
        document.title = title;
        ensureMetaByProp('og:title').setAttribute('content', title);
        const tw = document.querySelector('meta[name="twitter:title"]') || ensureMetaByName('twitter:title');
        tw.setAttribute('content', title);
    }
    function setDescription(desc) {
        const clean = String(desc || '').slice(0, 160);
        ensureMetaByName('description').setAttribute('content', clean);
        ensureMetaByProp('og:description').setAttribute('content', clean);
        const tw = document.querySelector('meta[name="twitter:description"]') || ensureMetaByName('twitter:description');
        tw.setAttribute('content', clean);
    }
    function setCanonical(url) {
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', url);
        ensureMetaByProp('og:url').setAttribute('content', url);
    }
    function setImage(url) {
        if (!url) return;
        ensureMetaByProp('og:image').setAttribute('content', url);
        const tw = document.querySelector('meta[name="twitter:image"]') || ensureMetaByName('twitter:image');
        tw.setAttribute('content', url);
        ensureMetaByProp('og:image:width').setAttribute('content', '1200');
        ensureMetaByProp('og:image:height').setAttribute('content', '630');
    }
    function setType(type) {
        ensureMetaByProp('og:type').setAttribute('content', type);
    }
    function setJSONLD(id, data) {
        let script = document.getElementById(id);
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = id;
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(data);
    }
    function setKeywords(keywords) {
        if (!keywords) return;
        ensureMetaByName('keywords').setAttribute('content', Array.isArray(keywords) ? keywords.join(', ') : keywords);
    }

    window.SEO = {
        setTitle,
        setDescription,
        setCanonical,
        setImage,
        setType,
        setJSONLD,
        setKeywords,
        ensureMetaByName,
        ensureMetaByProp
    };

    // Global defaults for all pages
    const siteUrl = 'https://livematches.hyper.co.ke';
    const defaultImage = siteUrl + '/icon-512.png';
    
    // Ensure basic tags exist on every page if missing
    if (!document.querySelector('meta[name="description"]')) {
        ensureMetaByName('description').setAttribute('content', 'ScoreHub - real-time live scores, fixtures, standings, stats, news, previews, reports and video highlights across 50+ worldwide leagues.');
    }
    if (!document.querySelector('meta[property="og:site_name"]')) {
        ensureMetaByProp('og:site_name').setAttribute('content', 'ScoreHub');
    }
    if (!document.querySelector('meta[property="og:type"]')) {
        setType('website');
    }
    if (!document.querySelector('link[rel="canonical"]')) {
        setCanonical(window.location.href.split('#')[0]);
    }

    // Organization + Website JSON-LD for every page. Reuse the ids the static
    // markup already ships (org-jsonld / website-jsonld) so each page ends up
    // with one Organization and one WebSite node instead of a duplicate pair.
    setJSONLD('org-jsonld', {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ScoreHub",
        "url": siteUrl,
        "logo": siteUrl + "/icon-512.png",
        "sameAs": []
    });
    setJSONLD('website-jsonld', {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ScoreHub",
        "url": siteUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": siteUrl + "/?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    });

    // Helper: SportsEvent JSON-LD
    window.SEO.sportsEvent = function(opts) {
        const data = {
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            "name": opts.name,
            "description": opts.description,
            "startDate": opts.startDate,
            "eventStatus": opts.eventStatus || "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "location": {
                "@type": "Place",
                "name": opts.venue || opts.league || "Football Stadium",
                "address": opts.venue || ""
            },
            "competitor": [
                { "@type": "SportsTeam", "name": opts.homeTeam, "logo": opts.homeLogo },
                { "@type": "SportsTeam", "name": opts.awayTeam, "logo": opts.awayLogo }
            ],
            "organizer": { "@type": "Organization", "name": "ScoreHub", "url": siteUrl },
            "sport": opts.sport || "Soccer"
        };
        if (opts.homeScore != null && opts.awayScore != null) {
            data["homeTeam"] = { "@type": "SportsTeam", "name": opts.homeTeam };
            data["awayTeam"] = { "@type": "SportsTeam", "name": opts.awayTeam };
        }
        setJSONLD('seo-sports-event', data);
    };

    window.SEO.newsArticle = function(opts) {
        const data = {
            "@context": "https://schema.org",
            "@type": opts.type || "NewsArticle",
            "headline": opts.headline,
            "description": opts.description,
            "image": opts.image ? [opts.image] : [defaultImage],
            "datePublished": opts.datePublished,
            "dateModified": opts.dateModified || opts.datePublished,
            "author": { "@type": "Organization", "name": opts.author || "ESPN" },
            "publisher": {
                "@type": "Organization",
                "name": "ScoreHub",
                "logo": { "@type": "ImageObject", "url": siteUrl + "/icon-192.png" }
            },
            "mainEntityOfPage": { "@type": "WebPage", "@id": opts.url || window.location.href }
        };
        setJSONLD('seo-news', data);
    };

    window.SEO.videoObject = function(opts) {
        const data = {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": opts.name,
            "description": opts.description,
            "thumbnailUrl": opts.thumbnailUrl,
            "uploadDate": opts.uploadDate,
            "contentUrl": opts.contentUrl,
            "embedUrl": opts.contentUrl
        };
        setJSONLD('seo-video', data);
    };

    window.SEO.breadcrumb = function(items) {
        const data = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items.map((it, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": it.name,
                "item": it.url
            }))
        };
        setJSONLD('seo-breadcrumb', data);
    };

    window.SEO.itemList = function(a, b) {
        let name, items;
        if (Array.isArray(a)) { items = a; name = b || 'ItemList'; } else { name = a; items = b; }
        if (!Array.isArray(items)) items = [];
        const data = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": name,
            "itemListElement": items.map((it, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": it.url || it,
                "name": it.name || it.url || ('Item ' + (i+1))
            }))
        };
        setJSONLD('seo-itemlist', data);
    };
})();
