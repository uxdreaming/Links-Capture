(function() {
    let on = false;
    let urls = [];
    let overlay = null;

    function createOverlay() {
        overlay = document.createElement('div');
        overlay.id = 'url-copier-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2147483647;
            cursor: crosshair;
            background: rgba(0,0,0,0.05);
        `;

        overlay.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            overlay.style.display = 'none';
            const el = document.elementFromPoint(e.clientX, e.clientY);
            overlay.style.display = 'block';

            const a = el?.closest('a[href]');
            if (a && a.href && !urls.includes(a.href)) {
                urls.push(a.href);
                showToast('URL ' + urls.length + ': ' + a.href);
            }
        });

        document.body.appendChild(overlay);
    }

    function showToast(msg) {
        let toast = document.getElementById('url-copier-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'url-copier-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #333;
                color: #fff;
                padding: 12px 18px;
                border-radius: 6px;
                font: 13px system-ui, sans-serif;
                z-index: 2147483647;
                max-width: 400px;
                word-break: break-all;
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.display = 'block';
    }

    function hideToast() {
        const toast = document.getElementById('url-copier-toast');
        if (toast) toast.remove();
    }

    function getAllPageUrls() {
        const links = document.querySelectorAll('a[href]');
        const uniqueUrls = new Set();

        links.forEach(a => {
            const href = a.href;
            // Filter valid http/https URLs
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                uniqueUrls.add(href);
            }
        });

        return Array.from(uniqueUrls);
    }

    document.addEventListener('keydown', function(e) {
        // Alt+Shift+U: Copy all links on page
        if (e.altKey && e.shiftKey && e.key === 'U') {
            e.preventDefault();
            const allUrls = getAllPageUrls();

            if (allUrls.length === 0) {
                showToast('No links found on this page');
                setTimeout(hideToast, 2000);
                return;
            }

            navigator.clipboard.writeText(allUrls.join('\n')).then(() => {
                showToast(allUrls.length + ' URLs copied to clipboard');
                setTimeout(hideToast, 2000);
            });
            return;
        }

        // Alt+U: Toggle manual selection mode
        if (e.altKey && !e.shiftKey && e.key === 'u') {
            e.preventDefault();
            on = !on;

            if (on) {
                urls = [];
                createOverlay();
                showToast('Click on links to capture (Alt+U to copy, Esc to cancel)');
            } else {
                overlay?.remove();
                overlay = null;

                if (urls.length) {
                    navigator.clipboard.writeText(urls.join('\n')).then(() => {
                        showToast(urls.length + ' URLs copied to clipboard');
                        setTimeout(hideToast, 2000);
                    });
                } else {
                    hideToast();
                }
                urls = [];
            }
        }

        if (e.key === 'Escape' && on) {
            e.preventDefault();
            on = false;
            overlay?.remove();
            overlay = null;
            urls = [];
            hideToast();
        }
    });
})();
