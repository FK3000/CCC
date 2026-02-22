/**
 * main.js – Einstiegspunkt der Anwendung
 * ========================================
 * Dieses File:
 *  1. Wartet bis das HTML vollständig geladen ist (DOMContentLoaded)
 *  2. Initialisiert i18n (Übersetzungen)
 *  3. Initialisiert den Router (Seitenwechsel)
 *  4. Initialisiert globale UI-Komponenten (Header, Mobile Menu etc.)
 */

/**
 * Wird von außen als "main" Objekt verwendet.
 * Enthält Funktionen die auch von router.js aufgerufen werden können.
 */
const main = (() => {

    // ── Init ───────────────────────────────────────────────────────────────

    /**
     * Hauptfunktion – startet alles in der richtigen Reihenfolge.
     *
     * async/await: Wir warten auf i18n.init() bevor der Router startet,
     * damit translations.json geladen ist bevor die erste Page gerendert wird.
     */
    async function init() {
        /*
         * DOMContentLoaded ist bereits gefeuert wenn wir hier ankommen
         * (weil die Scripts am Ende des <body> stehen).
         * Trotzdem sicher: Falls jemand die Script-Position ändert.
         */
        if (document.readyState === 'loading') {
            await new Promise(resolve =>
                document.addEventListener('DOMContentLoaded', resolve, { once: true })
            );
        }

        // 1. Übersetzungen laden und Sprachsystem starten
        await i18n.init();

        // 2. Router starten (lädt die erste Page)
        router.init();

        // 3. Globale UI-Komponenten initialisieren
        initHeader();
        initMobileMenu();
        initScrollAnimations();

        console.info('[main] App initialized.');
    }


    // ── Header ─────────────────────────────────────────────────────────────

    /**
     * Sticky Header: Fügt CSS-Klasse hinzu wenn nach unten gescrollt wird.
     * Die Klasse .scrolled kann in style.css für Schatten/Hintergrund genutzt werden.
     */
    function initHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        /*
         * IntersectionObserver wäre moderner, aber für diesen
         * einfachen Fall ist scroll-Event vollkommen ausreichend.
         */
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
        /*
         * passive: true → Teilt dem Browser mit dass dieser Handler
         * niemals preventDefault() aufruft. Browser kann dann
         * das Scrolling optimieren (bessere Performance).
         */
    }


    // ── Mobile Menu ────────────────────────────────────────────────────────

    /**
     * Hamburger-Menü für mobile Ansicht.
     * Toggled die .open-Klasse auf der Navigation.
     */
    function initMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (!toggle || !navMenu) return;

        toggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            toggle.classList.toggle('active', isOpen);

            /*
             * aria-expanded: Accessibility-Standard.
             * Sagt Screenreadern ob das Menü gerade offen oder geschlossen ist.
             * "true" = offen, "false" = geschlossen.
             */
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Menü schließen wenn ein Nav-Link angeklickt wird
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        /*
         * Menü schließen bei Klick außerhalb.
         * Wichtig für gute UX auf Mobile.
         */
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }


    // ── Scroll Animationen ─────────────────────────────────────────────────

    /**
     * Fade-In-Animation für Elemente wenn sie in den Viewport scrollen.
     * Elemente mit der Klasse .animate-on-scroll werden beobachtet.
     *
     * IntersectionObserver: Moderner, performanter Weg um zu prüfen
     * ob ein Element sichtbar ist. Viel besser als scroll-Events!
     */
    function initScrollAnimations() {
        /*
         * IntersectionObserver Optionen:
         * threshold: 0.1 = Element muss zu 10% sichtbar sein bevor es animiert
         * rootMargin: Etwas früher triggern bevor das Element voll im Viewport ist
         */
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    /*
                     * Nach der Animation nicht mehr beobachten.
                     * Spart Ressourcen und verhindert dass die
                     * Animation nochmal triggert.
                     */
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Alle animierbaren Elemente beobachten
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }


    // ── Public API ─────────────────────────────────────────────────────────
    return {
        init,
        initScrollAnimations   // wird von router.js nach Seitenwechsel aufgerufen
    };

})();

// App starten
main.init();
