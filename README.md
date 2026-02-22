# Carolina Clemens Consulting

Professional consulting website for development aid and humanitarian support.

## About

Strategic consulting services for NGOs, international organizations, and governments working in development aid and humanitarian response.

## Features

- Responsive design (mobile-first)
- EN / DE / PT language switcher (i18n via JSON)
- Single-Page Application (SPA) with client-side routing
- Material Design 3 principles (no framework, custom implementation)
- UNICEF-inspired humanitarian aesthetic
- Accessibility (ARIA, semantic HTML, keyboard navigation)
- Content Security Policy (CSP) headers

## Tech Stack

- HTML5
- CSS3 — custom design system based on Material Design 3 tokens (no frameworks)
- Vanilla JavaScript
- Google Fonts (Open Sans, Cabin)

## Corporate Design

The visual identity follows **Material Design 3** principles, implemented as a custom CSS token system.

### Color Tokens

| Token                      | Value     | Usage                          |
|---------------------------|-----------|-------------------------------|
| `--color-primary`         | `#1CABE2` | Buttons, active links, accents |
| `--color-primary-dark`    | `#0A4D7F` | Hover states, dark accents     |
| `--color-primary-light`   | `#E6F7FF` | Backgrounds, highlights        |
| `--color-on-surface`      | `#2C3E50` | Body text, headings            |
| `--color-surface`         | `#FFFFFF` | Page/card backgrounds          |
| `--color-surface-variant` | `#F4F8FB` | Top bar, footer background     |
| `--color-outline-variant` | `#D0E8F2` | Dividers, borders              |

### Typography

- **Headings:** Cabin (400, 600, 700)
- **Body / UI:** Open Sans (300, 400, 600, 700)
- Scale follows Material Design 3: Display → Headline → Title → Body → Label

### Spacing

4px base grid — spacing tokens: `--space-1` (4px) through `--space-16` (64px)

### Shape

Rounded corners via tokens: `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (16px), `--radius-full` (9999px)

## CSS Architecture

```
css/
├── tokens.css       ← Design tokens (colors, spacing, typography, shape, elevation)
├── base.css         ← CSS reset + global HTML element styles
├── typography.css   ← Text utility classes (.headline-large, .body-medium, etc.)
├── layout.css       ← Container, grid system, responsive breakpoints
└── components.css   ← Nav, buttons, cards, footer, loading spinner
```

## Local Development

```bash
# Python HTTP server (required for SPA routing + JS modules)
python -m http.server 8000
# → open http://localhost:8000
```

> **Note:** Opening `index.html` directly via `file://` will cause fetch errors for the router and i18n system. Always use a local server.

## Contact

For inquiries: contact@carolinaclemens.com
