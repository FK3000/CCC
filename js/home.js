/**
 * home.js – Card loader for the Home page
 * Called by router.js via initPageScripts() after home.html is rendered.
 *
 * Adding a new card:
 * 1. Create a .html fragment in subpages/home/
 * 2. Add the filename to the cards array below
 */

const homePage = (() => {

    const cards = [
        'monitoring-evaluation.html',
        'project-management.html',
        'capacity-building.html',
    ];

    async function init() {
        const gallery = document.getElementById('wid-gallery');
        const loading = document.getElementById('wid-loading');

        if (!gallery) return;

        const fetches = cards.map(file =>
            fetch(`subpages/home/${file}`)
                .then(res => {
                    if (!res.ok) throw new Error(`${file}: ${res.status}`);
                    return res.text();
                })
                .catch(err => {
                    console.warn('[home] Card failed to load:', err.message);
                    return null;
                })
        );

        const results = await Promise.all(fetches);
        if (loading) loading.remove();

        results.forEach(html => {
            if (html === null) return;
            const wrapper = document.createElement('div');
            wrapper.className = 'wid-card-wrapper';
            wrapper.innerHTML = html;
            gallery.appendChild(wrapper);
        });
    }

    return { init };

})();
