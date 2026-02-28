/**
 * router.js – Client-Side Router
 * ================================
 * Ein "Router" ist das System das entscheidet welche Seite/View
 * angezeigt wird, basierend auf der URL.
 *
 * Warum Client-Side Routing?
 * - Normale Links laden eine komplett neue HTML-Datei vom Server
 * - Unser Router fängt Klicks ab und lädt nur den Content-Bereich neu
 * - Nav und Footer bleiben bestehen → kein Flackern, schneller
 *
 * GitHub Pages Limitation:
 * - Kein eigener Webserver → kein URL-Rewriting möglich
 * - Deshalb verwenden wir Hash-basiertes Routing: index.html#about
 *   (der Teil nach # wird nie an den Server gesendet, nur vom Browser gelesen)
 */

const router = (() => {

    // ── Konfiguration ──────────────────────────────────────────────────────

    /**
     * Registrierte Pages.
     * Key = Route (Hash), Value = HTML-Datei in pages/
     *
     * Um eine neue Seite hinzuzufügen:
     *   'services': 'pages/services.html'
     */
    const ROUTES = {
        'home':     'pages/home.html',
        'about':    'pages/about.html',
        'services': 'pages/services.html',
        'contact':  'pages/contact.html',
        'imprint':  'pages/imprint.html',
    };

    /** Standard-Route wenn kein Hash in der URL ist */
    const DEFAULT_ROUTE = 'home';

    /** Cache: geladene Pages werden gespeichert um nicht nochmal zu fetchen */
    const pageCache = {};

    /** Referenz auf den Content-Bereich im DOM */
    const contentArea = document.getElementById('content');


    // ── Route ermitteln ────────────────────────────────────────────────────

    /**
     * Liest die aktuelle Route aus dem URL-Hash.
     * URL: index.html#about → gibt 'about' zurück
     * URL: index.html        → gibt DEFAULT_ROUTE zurück
     */
    function getCurrentRoute() {
        // window.location.hash = "#about" (mit #) → slice(1) entfernt das #
        const hash = window.location.hash.slice(1);
        return ROUTES[hash] ? hash : DEFAULT_ROUTE;
    }


    // ── Page laden ─────────────────────────────────────────────────────────

    /**
     * Lädt eine Page aus pages/ und zeigt sie im Content-Bereich an.
     *
     * @param {string} route - z.B. 'about'
     */
    async function navigate(route) {
        const filePath = ROUTES[route];

        if (!filePath) {
            console.warn(`[router] Unknown route: "${route}", redirecting to default.`);
            navigate(DEFAULT_ROUTE);
            return;
        }

        // Loading-State anzeigen
        showLoading();

        try {
            let html;

            // Cache prüfen: Wurde diese Page schon mal geladen?
            if (pageCache[route]) {
                /*
                 * Cache-Hit: HTML aus dem Speicher nehmen.
                 * Spart einen HTTP-Request und macht die Navigation schneller.
                 */
                html = pageCache[route];
                console.info(`[router] Loaded "${route}" from cache.`);
            } else {
                /*
                 * Cache-Miss: HTML-Datei vom Server laden.
                 * fetch() lädt die Datei asynchron (ohne die Seite zu blockieren).
                 */
                const response = await fetch(filePath);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Could not load ${filePath}`);
                }

                html = await response.text();

                // Im Cache speichern für nächstes Mal
                pageCache[route] = html;
                console.info(`[router] Loaded "${route}" from server.`);
            }

            // HTML in den Content-Bereich einfügen
            renderPage(html, route);

        } catch (error) {
            console.error('[router] Navigation failed:', error);
            showError(route);
        }
    }


    // ── Page rendern ───────────────────────────────────────────────────────

    /**
     * Schreibt den geladenen HTML-Content in den DOM
     * und führt alle notwendigen Updates durch.
     *
     * @param {string} html   - HTML-String aus der pages/*.html Datei
     * @param {string} route  - aktuelle Route für Meta-Updates
     */
    function renderPage(html, route) {
        /*
         * Sicherheitshinweis zu innerHTML:
         * Wir setzen hier innerHTML mit Inhalten aus eigenen HTML-Dateien
         * (pages/*.html) – das ist sicher weil wir diese Dateien selbst
         * kontrollieren. NIEMALS fremde/User-Inhalte per innerHTML einfügen!
         *
         * Alternative wäre DOMParser + appendChild, aber für eigene
         * statische Inhalte ist innerHTML akzeptabel und einfacher.
         */
        contentArea.innerHTML = html;

        // i18n: Alle [data-i18n]-Elemente in der neuen Page übersetzen
        if (typeof i18n !== 'undefined') {
            i18n.updateDOM();
        }

        // Nav-Links: Aktiven Link markieren
        updateActiveNavLink(route);

        // Browser-Tab Titel und Meta-Description aktualisieren
        updatePageMeta(route);

        // Scroll-Position zurück nach oben
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Initialize page-specific scripts
        initPageScripts(route);
    }


    // ── Navigation updaten ─────────────────────────────────────────────────

    /**
     * Setzt aria-current="page" auf den aktiven Nav-Link
     * und entfernt es von allen anderen.
     *
     * aria-current ist der Accessibility-Standard für "aktuelle Seite".
     * Screenreader lesen dieses Attribut vor.
     */
    function updateActiveNavLink(route) {
        document.querySelectorAll('[data-page]').forEach(link => {
            const isActive = link.getAttribute('data-page') === route;
            link.classList.toggle('active', isActive);

            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }


    // ── Meta-Daten aktualisieren ────────────────────────────────────────────

    /**
     * Aktualisiert <title> und <meta name="description">
     * basierend auf der aktuellen Route und Sprache.
     *
     * SEO-relevant: Jede "Seite" sollte einen eigenen Titel haben,
     * auch wenn es technisch eine Single-Page-App ist.
     */
    function updatePageMeta(route) {
        if (typeof i18n === 'undefined') return;

        const titleKey = `page.${route}.title`;
        const metaKey  = `page.${route}.meta`;

        // Titel setzen
        const title = i18n.t(titleKey);
        if (title !== titleKey) {
            document.title = title;
        }

        // Meta-Description aktualisieren
        const metaDesc = document.querySelector('meta[name="description"]');
        const desc = i18n.t(metaKey);
        if (metaDesc && desc !== metaKey) {
            metaDesc.setAttribute('content', desc);
        }
    }


    // ── Loading & Error States ─────────────────────────────────────────────

    /** Zeigt einen Ladezustand an während die Page geladen wird */
    function showLoading() {
        contentArea.innerHTML = `
            <div class="page-loading" role="status" aria-label="Loading page">
                <div class="loading-spinner"></div>
            </div>`;
        /*
         * role="status" + aria-label: Screenreader wissen dass
         * hier gerade etwas geladen wird.
         */
    }

    /** Zeigt eine Fehlermeldung wenn eine Page nicht geladen werden kann */
    function showError(route) {
        contentArea.innerHTML = `
            <div class="page-error">
                <h2>Page not found</h2>
                <p>Could not load page: <code>${route}</code></p>
                <a href="#home" class="btn-primary">Back to Home</a>
            </div>`;
    }


    // ── Page-spezifische Scripts ───────────────────────────────────────────

    /**
     * Nachdem eine neue Page geladen wurde, müssen dort enthaltene
     * interaktive Elemente initialisiert werden.
     * (z.B. Scroll-Animationen, Formulare etc.)
     * Wird in main.js erweitert wenn neue Pages dazukommen.
     */
    function initPageScripts(route) {
        // Re-initialize scroll animations
        if (typeof main !== 'undefined' && main.initScrollAnimations) {
            main.initScrollAnimations();
        }

        // Initialize page-specific scripts
        if (route === 'home' && typeof homePage !== 'undefined') {
            homePage.init();
        }
    }


    // ── Event Listeners ────────────────────────────────────────────────────

    /**
     * hashchange-Event: Wird gefeuert wenn sich der URL-Hash ändert.
     * Beispiel: User klickt einen Link, URL wechselt zu index.html#about
     * → navigate('about') wird aufgerufen.
     */
    function bindEvents() {
        window.addEventListener('hashchange', () => {
            navigate(getCurrentRoute());
        });

        /*
         * popstate-Event: Wird gefeuert wenn der User den
         * Browser-Zurück/Vorwärts-Button benutzt.
         * Stellt sicher dass die Navigation korrekt funktioniert.
         */
        window.addEventListener('popstate', () => {
            navigate(getCurrentRoute());
        });

        /*
         * Auf Sprachwechsel reagieren:
         * Wenn die Sprache geändert wird, müssen Titel und Meta
         * der aktuellen Page in der neuen Sprache gesetzt werden.
         */
        document.addEventListener('langchange', () => {
            updatePageMeta(getCurrentRoute());
        });
    }


    // ── Init ───────────────────────────────────────────────────────────────

    /** Startet den Router – wird von main.js aufgerufen */
    function init() {
        bindEvents();
        // Beim Start: aktuelle Route aus der URL laden
        navigate(getCurrentRoute());
        console.info('[router] Initialized.');
    }


    // ── Public API ─────────────────────────────────────────────────────────
    return {
        init,
        navigate,
        get currentRoute() { return getCurrentRoute(); }
    };

})();
