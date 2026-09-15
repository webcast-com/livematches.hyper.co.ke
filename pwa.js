/* ScoreHub PWA — service-worker registration + install prompt.
   Wires install functionality to footer Google Play & App Store buttons,
   handling native PWA prompt, iOS Safari Add to Home Screen, and standalone checks. */
(function () {
    'use strict';

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () {});
        });
    }

    var deferredPrompt = null;

    function getI18nText(key, fallback) {
        if (typeof window.t === 'function') {
            try {
                var s = window.t(key);
                if (s && s !== key) return s;
            } catch (e) {}
        }
        return fallback;
    }

    function showInstallFeedback(message) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, true);
            return;
        }
        var existing = document.querySelector('.pwa-install-toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.className = 'pwa-install-toast notification-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.classList.add('hide');
            setTimeout(function () { if (toast.parentNode) toast.remove(); }, 400);
        }, 4500);
    }

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        var targets = document.querySelectorAll('#install-google-play, #install-app-store, .download-badge, #install-btn');
        targets.forEach(function (btn) {
            btn.classList.add('can-install');
            if (btn.hasAttribute('hidden')) btn.hidden = false;
        });
    });

    document.addEventListener('click', function (e) {
        var trigger = e.target && e.target.closest
            ? e.target.closest('#install-google-play, #install-app-store, .badge-google-play, .badge-app-store, .download-badge, #install-btn')
            : null;
        if (!trigger) return;
        e.preventDefault();

        var isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ||
                           (typeof navigator !== 'undefined' && ('standalone' in navigator && navigator.standalone));
        if (isStandalone) {
            showInstallFeedback(getI18nText('pwa.installed', 'ScoreHub is already installed on your device!'));
            return;
        }

        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function (choice) {
                if (choice && choice.outcome === 'accepted') {
                    showInstallFeedback(getI18nText('pwa.success', 'ScoreHub installed successfully!'));
                }
                deferredPrompt = null;
            }).catch(function () {});
            return;
        }

        var isIOS = (typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)));
        var isAppleBadge = trigger.matches && (trigger.matches('#install-app-store') || trigger.matches('.badge-app-store'));

        if (isIOS || isAppleBadge) {
            showInstallFeedback(getI18nText('pwa.guide.ios', 'To install on iOS: Tap Share in Safari, then select "Add to Home Screen" ➕'));
        } else {
            showInstallFeedback(getI18nText('pwa.guide.generic', 'To install ScoreHub: Open browser menu (⋮) and tap "Install app" or "Add to Home screen"'));
        }
    });

    window.addEventListener('appinstalled', function () {
        deferredPrompt = null;
        var btn = document.getElementById('install-btn');
        if (btn) btn.hidden = true;
        showInstallFeedback(getI18nText('pwa.success', 'ScoreHub installed successfully!'));
    });
})();
