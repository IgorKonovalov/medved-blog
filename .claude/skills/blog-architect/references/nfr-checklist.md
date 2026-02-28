# Non-Functional Requirements Checklist

Use this checklist when reviewing code or creating implementation plans. Not every item applies to every change — use judgement.

## Performance

- [ ] **Zero JS by default** — no client-side JavaScript unless the component is interactive (Astro island with `client:*` directive)
- [ ] **Island justification** — every `client:load`, `client:visible`, `client:idle` has a documented reason
- [ ] **Image optimization** — uses Astro `<Image>` or `<Picture>` component, not raw `<img>` tags; appropriate format (WebP/AVIF with fallback)
- [ ] **No layout shifts** — images have explicit `width` and `height`; fonts use `font-display: swap`
- [ ] **Critical CSS** — Astro scopes styles by default; no large global CSS imports
- [ ] **Lazy loading** — below-fold images use `loading="lazy"`; above-fold images do NOT
- [ ] **No unnecessary dependencies** — each `yarn add <pkg>` must be justified; prefer built-in Astro features over third-party packages

## SEO

- [ ] **Title tag** — unique, under 60 characters, includes primary keyword
- [ ] **Meta description** — unique, under 160 characters, in Russian
- [ ] **Canonical URL** — set on every page
- [ ] **Open Graph tags** — `og:title`, `og:description`, `og:image` for social sharing
- [ ] **Structured data** — JSON-LD for LocalBusiness (homepage), Article (blog posts), Review (testimonials)
- [ ] **Sitemap** — `@astrojs/sitemap` integration configured
- [ ] **Semantic HTML** — `<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`, headings in correct hierarchy (no skipping h1→h3)
- [ ] **Russian URL slugs** — transliterated, lowercase, hyphens (e.g., `/uslugi/remont-provodki/`)

## Accessibility

- [ ] **Language attribute** — `<html lang="ru">`
- [ ] **Alt text** — all images have descriptive `alt` in Russian (decorative images use `alt=""`)
- [ ] **Keyboard navigation** — all interactive elements reachable and operable via keyboard
- [ ] **Focus indicators** — visible focus styles on interactive elements
- [ ] **Color contrast** — minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- [ ] **Touch targets** — minimum 44x44px on mobile for buttons and links
- [ ] **ARIA labels** — on icon-only buttons (phone icon, messenger icons)
- [ ] **Form labels** — all form inputs have associated `<label>` elements
- [ ] **Error messages** — form validation errors announced to screen readers

## Mobile

- [ ] **Responsive** — works on 320px–1440px+ viewport widths
- [ ] **Mobile-first CSS** — base styles for mobile, `@media` queries for larger screens
- [ ] **Sticky CTA bar** — phone call + WhatsApp buttons fixed at bottom on mobile
- [ ] **Tap targets** — no overlapping tap targets; sufficient spacing between links
- [ ] **No horizontal scroll** — content fits viewport at all breakpoints
- [ ] **Fast on 4G** — total page weight target under 500KB (including images)

## Security

- [ ] **Form validation** — server-side validation in Cloudflare Worker (never trust client-only)
- [ ] **Rate limiting** — callback form limited to prevent spam (3 requests/IP/hour)
- [ ] **Input sanitization** — phone numbers and text inputs sanitized before Telegram API call
- [ ] **No secrets in client code** — Telegram bot token only in Worker environment variables, never in frontend
- [ ] **CSP headers** — Content-Security-Policy configured in Cloudflare Pages headers
- [ ] **HTTPS only** — redirect HTTP to HTTPS (Cloudflare handles this by default)

## Code Quality

- [ ] **TypeScript strict** — no `any` types; use proper interfaces for props, content schemas
- [ ] **Astro component conventions** — logic in frontmatter fence (`---`), minimal inline scripts
- [ ] **Component naming** — PascalCase for `.astro` components, matching filename
- [ ] **No dead code** — remove unused imports, components, styles
- [ ] **Content Collection types** — all content accessed through `getCollection()` / `getEntry()` with proper typing
- [ ] **Scoped styles** — prefer Astro scoped `<style>` over global CSS; global CSS only for design tokens and resets
