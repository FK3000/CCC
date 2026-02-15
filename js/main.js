// Language Switcher
const langButtons = document.querySelectorAll('.lang-btn');
const body = document.body;

langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        
        // Update active state
        langButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update body lang attribute
        body.dataset.lang = lang;
        
        // Update all translatable elements
        document.querySelectorAll('[data-en]').forEach(element => {
            if (lang === 'en') {
                element.textContent = element.dataset.en;
            } else if (lang === 'de') {
                element.textContent = element.dataset.de;
            }
        });
        
        // Save preference
        localStorage.setItem('preferredLanguage', lang);
    });
});

// Load saved language preference
const savedLang = localStorage.getItem('preferredLanguage') || 'en';
const savedBtn = document.querySelector(`.lang-btn[data-lang="${savedLang}"]`);
if (savedBtn) {
    savedBtn.click();
}

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header Scroll Effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    }
    
    lastScroll = currentScroll;
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and stat cards
document.querySelectorAll('.service-card, .stat-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// Console Message
console.log('%cCarolina Clemens Consulting', 'color: #1CABE2; font-size: 24px; font-weight: bold;');
console.log('%cStrategic consulting for sustainable development', 'color: #5A6C7D; font-size: 14px;');
