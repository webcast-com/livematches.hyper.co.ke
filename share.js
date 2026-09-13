/* Share kit — canvas share cards (1200x630 PNG), Web Share API with
   download fallback, social deep links and copy-link. Pure helpers
   (shareLinks, shareFileName) are top-level and side-effect free for
   testability. Canvas/network/clipboard helpers touch the DOM only when
   called from a wired share section. */

function shareLinks(url, text) {
    const u = encodeURIComponent(url), t = encodeURIComponent(text);
    return {
        whatsapp: `https://wa.me/?text=${t}%20${u}`,
        x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        telegram: `https://t.me/share/url?url=${u}&text=${t}`
    };
}

function shareFileName(s) {
    return String(s || "scorehub-card").toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        .slice(0, 60) + ".png";
}

function shareSectionHTML() {
    return `<div class="pred-subrow"><h2 class="pred-sub">Share this</h2></div>`
        + `<canvas id="share-canvas" class="share-canvas" width="1200" height="630"></canvas>`
        + `<div class="share-row" id="share-row">`
        + `<button class="btn btn-primary btn-sm" data-share="card">📤 Share card</button>`
        + `<button class="btn btn-login btn-sm" data-share="download">⬇ Download</button>`
        + `<a class="btn btn-login btn-sm" data-share="whatsapp" target="_blank" rel="noopener">WhatsApp</a>`
        + `<a class="btn btn-login btn-sm" data-share="x" target="_blank" rel="noopener">X</a>`
        + `<a class="btn btn-login btn-sm" data-share="telegram" target="_blank" rel="noopener">Telegram</a>`
        + `<a class="btn btn-login btn-sm" data-share="facebook" target="_blank" rel="noopener">Facebook</a>`
        + `<button class="btn btn-login btn-sm" data-share="copy">🔗 Copy link</button>`
        + `</div>`;
}

function fitFont(ctx, text, maxWidth, base, weight) {
    let size = base;
    const fam = "Arial, Helvetica, sans-serif";
    ctx.font = `${weight || 800} ${size}px ${fam}`;
    while (size > 20 && ctx.measureText(text).width > maxWidth) {
        size -= 4;
        ctx.font = `${weight || 800} ${size}px ${fam}`;
    }
    return size;
}

function drawShareCard(canvas, data) {
    if (!canvas || !canvas.getContext) return false;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0b1526");
    bg.addColorStop(0.6, "#0e2233");
    bg.addColorStop(1, "#123047");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#00f2fe";
    ctx.fillRect(0, 0, W, 10);
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#4facfe";
    ctx.beginPath(); ctx.arc(W - 120, H - 60, 260, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(120, 120, 150, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.fillStyle = "#00f2fe";
    fitFont(ctx, data.kicker || "", W - 160, 34, 700);
    ctx.fillText(data.kicker || "", W / 2, 110);
    const title = `${data.home || ""}  vs  ${data.away || ""}`;
    ctx.fillStyle = "#ffffff";
    fitFont(ctx, title, W - 120, 84, 800);
    ctx.fillText(title, W / 2, 260);
    ctx.fillStyle = "#4facfe";
    fitFont(ctx, data.middle || "", W - 160, 64, 800);
    ctx.fillText(data.middle || "", W / 2, 360);
    ctx.fillStyle = "#cbd5e1";
    fitFont(ctx, data.sub || "", W - 160, 40, 600);
    ctx.fillText(data.sub || "", W / 2, 450);
    ctx.fillStyle = "#64748b";
    ctx.font = "600 30px Arial, Helvetica, sans-serif";
    ctx.fillText("livematches.hyper.co.ke", W / 2, 540);
    ctx.textAlign = "left";
    ctx.fillStyle = "#00f2fe";
    ctx.font = "800 30px Arial, Helvetica, sans-serif";
    ctx.fillText("ScoreHub", 60, 585);
    ctx.textAlign = "right";
    ctx.fillStyle = "#64748b";
    ctx.font = "600 26px Arial, Helvetica, sans-serif";
    ctx.fillText(data.tag || "", W - 60, 585);
    return true;
}

function canvasToBlob(canvas) {
    return new Promise((resolve) => {
        if (canvas && canvas.toBlob) canvas.toBlob(resolve, "image/png");
        else resolve(null);
    });
}

function downloadBlob(blob, filename) {
    if (!blob) return false;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || "scorehub-card.png";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    return true;
}

async function shareCard(canvas, meta) {
    const blob = await canvasToBlob(canvas);
    const file = blob ? new File([blob], meta.filename || "scorehub-card.png", { type: "image/png" }) : null;
    if (file && typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({ title: meta.title, text: `${meta.text} ${meta.url}`, files: [file] });
            return "shared";
        } catch (e) {
            if (e && e.name === "AbortError") return "cancelled";
        }
    }
    return downloadBlob(blob, meta.filename) ? "downloaded" : "failed";
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
            return true;
        } catch (e2) { return false; }
    }
}

function flashShareBtn(btn, text) {
    const orig = btn.innerHTML;
    btn.innerHTML = text;
    setTimeout(() => { btn.innerHTML = orig; }, 1800);
}

function wireShareButtons(root, meta) {
    if (!root) return;
    const links = shareLinks(meta.url, meta.text);
    root.querySelectorAll("a[data-share]").forEach((a) => {
        if (links[a.dataset.share]) a.href = links[a.dataset.share];
    });
    const canvas = document.getElementById("share-canvas");
    root.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-share]");
        if (!btn || btn.tagName === "A") return;
        const kind = btn.dataset.share;
        if (kind === "card") {
            btn.disabled = true;
            const r = await shareCard(canvas, meta);
            btn.disabled = false;
            if (r === "shared") flashShareBtn(btn, "Shared ✓");
            else if (r === "downloaded") flashShareBtn(btn, "Downloaded ✓");
            else if (r === "failed") flashShareBtn(btn, "Failed — try download");
        } else if (kind === "download") {
            const blob = await canvasToBlob(canvas);
            flashShareBtn(btn, downloadBlob(blob, meta.filename) ? "Downloaded ✓" : "Download failed");
        } else if (kind === "copy") {
            flashShareBtn(btn, (await copyText(meta.url)) ? "Copied ✓" : "Copy failed");
        }
    });
}
