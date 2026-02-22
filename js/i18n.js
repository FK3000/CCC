/**
 * i18n.js – Internationalisierung (Mehrsprachigkeit)
 * ====================================================
 * "i18n" ist eine Abkürzung für "internationalization"
 * (18 Buchstaben zwischen i und n).
 *
 * Dieses Modul:
 *  1. Lädt translations.json (einmalig beim Start)
 *  2. Stellt die Funktion t(key) bereit → gibt den übersetzten Text zurück
 *  3. Aktualisiert alle [data-i18n]-Elemente auf der Seite
 *  4. Setzt das lang-Attribut am <html>-Tag
 *  5. Speichert die gewählte Sprache im localStorage
 *  6. Feuert ein Custom Event "langchange" damit router.js reagieren kann
 */

const i18n = (() => {

    // ── State ──────────────────────────────────────────────────────────────

    /** Alle geladenen Übersetzungen aus translations.json */
    let translations = {};

    /** Aktuell aktive Sprache */
    let currentLang = 'en';

    /** Unterstützte Sprachen – hier ergänzen wenn neue dazukommen */
    const SUPPORTED_LANGS = ['en', 'de', 'pt'];

    /** Fallback-Sprache wenn ein Key in der gewählten Sprache fehlt */
    const FALLBACK_LANG = 'en';


    // ── Laden ──────────────────────────────────────────────────────────────

    /**
     * Lädt translations.json vom Server.
     * Wird einmalig beim Start aufgerufen.
     * Gibt ein Promise zurück – main.js wartet darauf bevor es startet.
     */
    async function load() {
        try {
            /*
             * fetch() ist die moderne Art HTTP-Requests zu machen.
             * Wir laden eine lokale JSON-Datei – kein externer Server nötig.
             * Das funktioniert auf GitHub Pages problemlos.
             */
            const response = await fetch('i18n/translations.json');

            if (!response.ok) {
                throw new Error(`Failed to load translations: ${response.status}`);
            }

            translations = await response.json();
            console.info('[i18n] Translations loaded successfully.');

        } catch (error) {
            console.error('[i18n] Could not load translations.json:', error);
            /*
             * Graceful degradation: Wenn die Datei nicht ladbar ist,
             * zeigen wir einfach den Fallback-Text der im HTML steht.
             * Die Seite funktioniert dann nur in Englisch.
             */
        }
    }


    // ── Sprache ermitteln ──────────────────────────────────────────────────

    /**
     * Bestimmt welche Sprache beim Start verwendet werden soll.
     * Priorität:
     *  1. URL-Parameter ?lang=de  (z.B. für direkte Links in bestimmter Sprache)
     *  2. localStorage (zuletzt gewählte Sprache)
     *  3. Browser-Sprache (navigator.language)
     *  4. Fallback: 'en'
     */
    function detectLanguage() {
        // 1. URL-Parameter prüfen
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && SUPPORTED_LANGS.includes(urlLang)) {
            return urlLang;
        }

        // 2. localStorage prüfen
        const savedLang = localStorage.getItem('ccc-lang');
        if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
            return savedLang;
        }

        // 3. Browser-Sprache prüfen (z.B. "de-DE" → "de")
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && SUPPORTED_LANGS.includes(browserLang)) {
            return browserLang;
        }

        // 4. Fallback
        return FALLBACK_LANG;
    }


    // ── Übersetzung abrufen ────────────────────────────────────────────────

    /**
     * Gibt den übersetzten Text für einen Key zurück.
     *
     * @param {string} key - z.B. "nav.about" oder "home.hero.title"
     * @returns {string} Übersetzter Text oder Key als Fallback
     *
     * Beispiel:
     *   t('nav.about')  →  "About us" (EN) / "Über uns" (DE)
     */
    function t(key) {
        // Erst in der aktuellen Sprache suchen
        const value = translations[currentLang]?.[key];
        if (value !== undefined) return value;

        // Fallback: in Englisch suchen
        const fallback = translations[FALLBACK_LANG]?.[key];
        if (fallback !== undefined) {
            console.warn(`[i18n] Key "${key}" missing in "${currentLang}", using fallback.`);
            return fallback;
        }

        // Wenn gar nichts gefunden: Key selbst zurückgeben (sichtbares Signal)
        console.warn(`[i18n] Translation key not found: "${key}"`);
        return key;
    }


    // ── DOM aktualisieren ──────────────────────────────────────────────────

    /**
     * Aktualisiert alle Elemente mit [data-i18n] im DOM.
     * Wird bei jedem Sprachwechsel UND nach dem Laden einer neuen Page aufgerufen.
     *
     * Sicherheitshinweis: Wir verwenden textContent statt innerHTML.
     * textContent interpretiert keinen HTML-Code → kein XSS-Risiko.
     * Ausnahme: Elemente mit data-i18n-html dürfen HTML enthalten
     * (nur für vertrauenswürdige, eigene Inhalte aus translations.json).
     */
    function updateDOM() {
        // Alle Elemente mit data-i18n finden
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = t(key);

            /*
             * textContent = sicher (kein HTML-Parsing)
             * Für die meisten Texte ausreichend.
             */
            el.textContent = text;
        });

        // Elemente die HTML enthalten dürfen (z.B. <span> in Headings)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            /*
             * innerHTML NUR für eigene, kontrollierte Inhalte aus
             * translations.json – niemals für User-Input!
             */
            el.innerHTML = t(key);
        });

        /*
         * lang-Attribut am <html>-Tag setzen.
         * Wichtig für:
         * - Screenreader (korekte Aussprache)
         * - Suchmaschinen (Sprache des Inhalts erkennen)
         * - CSS :lang() Selektor
         */
        document.documentElement.lang = t('lang.html') || currentLang;

        // Aktiven Sprachbutton markieren
        document.querySelectorAll('[data-lang-btn]').forEach(btn => {
            const isActive = btn.getAttribute('data-lang-btn') === currentLang;
            btn.classList.toggle('active', isActive);
            /*
             * aria-pressed: Teilt Screenreadern mit ob ein Button
             * "gedrückt"/aktiv ist. Standard für Toggle-Buttons.
             */
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }


    // ── Sprache wechseln ───────────────────────────────────────────────────

    /**
     * Wechselt die aktive Sprache.
     *
     * @param {string} lang - Sprachcode: 'en', 'de' oder 'pt'
     */
    function setLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            console.warn(`[i18n] Unsupported language: "${lang}"`);
            return;
        }

        currentLang = lang;

        // In localStorage speichern → bleibt beim nächsten Besuch erhalten
        localStorage.setItem('ccc-lang', lang);

        // DOM updaten
        updateDOM();

        /*
         * Custom Event feuern.
         * router.js und main.js können darauf reagieren,
         * z.B. um den <title> der aktuellen Page zu updaten.
         *
         * CustomEvent ist der saubere Weg für Kommunikation
         * zwischen unabhängigen JS-Modulen ohne direkte Abhängigkeiten.
         */
        document.dispatchEvent(new CustomEvent('langchange', {
            detail: { lang }
        }));
    }


    // ── Init ───────────────────────────────────────────────────────────────

    /**
     * Initialisierung – wird von main.js aufgerufen.
     * Lädt Übersetzungen, erkennt Sprache, bindet Events.
     */
    async function init() {
        await load();
        currentLang = detectLanguage();

        // Klick-Events auf Sprachbuttons
        document.querySelectorAll('[data-lang-btn]').forEach(btn => {
            btn.addEventListener('click', () => {
                setLanguage(btn.getAttribute('data-lang-btn'));
            });
        });

        updateDOM();
    }


    // ── Public API ─────────────────────────────────────────────────────────
    /*
     * Das Revealing Module Pattern:
     * Nur die Funktionen die von außen gebraucht werden sind public.
     * Alles andere (translations, currentLang etc.) ist privat.
     */
    return {
        init,
        t,
        updateDOM,
        setLanguage,
        get currentLang() { return currentLang; }
    };

})();
