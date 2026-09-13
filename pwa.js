/* ScoreHub PWA — service-worker registration + install prompt. Safe no-op where unsupported. */
(function () {
    'use strict';
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () {});
        });
    }
    var deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        const btn = document.getElementById('install-btn');
        if (btn) btn.hidden = false;
    });
    document.addEventListener('click', function (e) {
        const btn = e.target && e.target.closest ? e.target.closest('#install-btn') : null;
        if (!btn || !deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
            deferredPrompt = null;
            btn.hidden = true;
        }).catch(function () {});
    });
    window.addEventListener('appinstalled', function () {
        const btn = document.getElementById('install-btn');
        if (btn) btn.hidden = true;
    });
})();
