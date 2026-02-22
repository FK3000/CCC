/**
 * contact.js – Secure Contact Form Handler
 * ==========================================
 * Handles form submission via Formspree.
 *
 * SETUP:
 * 1. Create account at https://formspree.io
 * 2. Create a new form → copy your Form ID
 * 3. Replace YOUR_FORM_ID below with your actual ID
 *
 * SECURITY:
 * - Honeypot field (_gotcha) catches bots
 * - Client-side validation before submission
 * - No email address exposed in source code
 * - Rate limiting handled by Formspree
 */

(function () {

    // ── CONFIG ─────────────────────────────────────────────────────────────
    // Replace with your actual Formspree Form ID
    const FORMSPREE_ID = 'YOUR_FORM_ID';
    const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_ID}`;


    // ── INIT ───────────────────────────────────────────────────────────────

    function init() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        // Character counter for message field
        const textarea = document.getElementById('contact-message');
        const charCount = document.getElementById('char-count');
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                charCount.textContent = textarea.value.length;
            });
        }

        // Form submit handler
        form.addEventListener('submit', handleSubmit);
    }


    // ── VALIDATION ─────────────────────────────────────────────────────────

    /**
     * Validates all required fields.
     * Adds .has-error class to invalid fields.
     * Returns true if valid, false if not.
     */
    function validate(form) {
        let valid = true;

        // Clear previous errors
        form.querySelectorAll('.form-field').forEach(field => {
            field.classList.remove('has-error');
        });

        // Name
        const name = form.querySelector('#contact-name');
        if (!name.value.trim() || name.value.trim().length < 2) {
            name.closest('.form-field').classList.add('has-error');
            valid = false;
        }

        // Email
        const email = form.querySelector('#contact-email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
            email.closest('.form-field').classList.add('has-error');
            valid = false;
        }

        // Message
        const message = form.querySelector('#contact-message');
        if (!message.value.trim() || message.value.trim().length < 10) {
            message.closest('.form-field').classList.add('has-error');
            valid = false;
        }

        return valid;
    }


    // ── SUBMIT ─────────────────────────────────────────────────────────────

    async function handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = document.getElementById('contact-submit');
        const successMsg = document.getElementById('form-success');
        const errorMsg = document.getElementById('form-error');

        // Honeypot check – if filled, silently reject (bot detected)
        const honeypot = form.querySelector('input[name="_gotcha"]');
        if (honeypot && honeypot.value) {
            // Pretend success to not tip off the bot
            showSuccess(form, submitBtn, successMsg);
            return;
        }

        // Validate
        if (!validate(form)) return;

        // Loading state
        setLoading(submitBtn, true);
        errorMsg.hidden = true;

        try {
            const data = new FormData(form);

            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showSuccess(form, submitBtn, successMsg);
            } else {
                throw new Error(`Response: ${response.status}`);
            }

        } catch (err) {
            console.error('[contact] Submission failed:', err);
            setLoading(submitBtn, false);
            errorMsg.hidden = false;
        }
    }


    // ── HELPERS ────────────────────────────────────────────────────────────

    function setLoading(btn, loading) {
        btn.classList.toggle('is-loading', loading);
        btn.disabled = loading;
    }

    function showSuccess(form, btn, successMsg) {
        form.hidden = true;
        btn.hidden = true;
        successMsg.hidden = false;
    }


    // ── Start ──────────────────────────────────────────────────────────────
    // Wait for router to load the page content before initializing
    document.addEventListener('pageloaded', init);

    // Also try direct init in case page is already loaded
    if (document.getElementById('contact-form')) init();

})();
