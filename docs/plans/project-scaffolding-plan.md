# Implementation Plan: Project Scaffolding

> Created: 2026-02-25
> Status: draft

## Overview

Scaffold the medved-blog Astro project from an empty repo to a running site skeleton with all Content Collections configured, core layout components in place, global styles established, and a placeholder page for every route in the site map. At the end of this plan, `pnpm dev` serves a navigable site with real structure and dummy content — ready for feature work to fill in.

## Phases

This plan is split into 5 phases. Each phase ends with a manual testing checkpoint. Phases are sequential — each depends on the previous one.

| Phase | What it delivers | Estimated complexity |
|---|---|---|
| 1 | Astro project + tooling + dev server boots | S |
| 2 | Content Collections + seed content | M |
| 3 | Base layout, header, footer, global styles | M |
| 4 | All page routes with placeholder content | M |
| 5 | Cloudflare Pages config + production build | S |

---

## Phase 1: Project Initialization

> **Goal**: Astro project created, TypeScript strict, pnpm, dev server runs.

### New files to create

| File | Purpose |
|---|---|
| `package.json` | Project manifest (created by `pnpm create astro`) |
| `astro.config.mjs` | Astro configuration with sitemap integration |
| `tsconfig.json` | Extends `astro/tsconfigs/strict` |
| `.gitignore` | Updated with Astro/node ignores alongside existing Claude ignores |
| `.nvmrc` | Pin Node.js version for CI consistency |
| `src/env.d.ts` | Astro environment type declarations |

### Step 1.1: Scaffold Astro project

- **Complexity**: S
- **What**: Run `pnpm create astro@latest` with the minimal (empty) template, TypeScript strict mode. This generates `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, and a starter `src/pages/index.astro`.
- **Important**: The scaffolder will try to create in a subdirectory — we need it to scaffold in the current repo root. Use `.` as the target directory. If the scaffolder conflicts with existing files (docs, .claude), resolve by keeping our existing files.
- **Acceptance**: `pnpm install` completes without errors.

### Step 1.2: Configure TypeScript strict

- **Complexity**: S
- **Files**: `tsconfig.json`
- **What**: Ensure `tsconfig.json` extends `astro/tsconfigs/strict`. The scaffolder usually sets this if you choose "strict" during setup. Verify it's correct.
- **Acceptance**: `pnpm astro check` runs with no errors.

### Step 1.3: Add Astro integrations

- **Complexity**: S
- **Files**: `astro.config.mjs`, `package.json`
- **What**: Install and configure essential Astro integrations:
  - `@astrojs/sitemap` — sitemap generation
  - `@astrojs/cloudflare` — Cloudflare Pages adapter (needed for the Worker form handler later; even though the site is mostly static, the adapter enables `hybrid` mode for select server routes)
- **Command**: `pnpm astro add sitemap cloudflare`
- **Note**: Set `output: 'static'` for now. We'll switch to `hybrid` in a later plan when adding the callback form Worker.
- **Acceptance**: Both integrations listed in `astro.config.mjs`.

### Step 1.4: Update .gitignore

- **Complexity**: S
- **Files**: `.gitignore`
- **What**: Merge the existing Claude-specific ignores with standard Astro/Node ignores:
  ```
  # Dependencies
  node_modules/

  # Build output
  dist/

  # Astro
  .astro/

  # Environment
  .env
  .env.*
  !.env.example

  # OS
  .DS_Store
  Thumbs.db

  # Claude Code
  .claude/settings.local.json
  CLAUDE.local.md
  ```
- **Acceptance**: `git status` shows no `node_modules/` or `dist/` tracked.

### Step 1.5: Add .nvmrc

- **Complexity**: S
- **Files**: `.nvmrc`
- **What**: Pin Node.js to `22` (LTS, matches Cloudflare Pages default build environment).
- **Acceptance**: File exists with content `22`.

### Manual Testing — Phase 1

```
1. Run `pnpm dev`
2. Open http://localhost:4321 in browser
3. Verify: Astro welcome page or blank page loads without errors
4. Check terminal: no TypeScript errors, no warnings
5. Run `pnpm build` — verify it completes and produces `dist/` directory
6. Run `pnpm astro check` — verify zero errors
```

---

## Phase 2: Content Collections & Seed Content

> **Goal**: All three collections (services, blog, testimonials) defined with Zod schemas. One seed entry per collection so schemas are validated at build time.

### New files to create

| File | Purpose |
|---|---|
| `src/content.config.ts` | Content Collection definitions with Zod schemas |
| `src/content/services/diagnostika-elektriki/index.md` | Seed service page |
| `src/content/blog/primer-stati/index.md` | Seed blog post |
| `src/content/testimonials/ivan-petrov.md` | Seed testimonial |

### Step 2.1: Define Content Collections

- **Complexity**: M
- **Files**: `src/content.config.ts`
- **What**: Create the config file defining three collections with the schemas from the architecture decisions:

  **Services**:
  ```typescript
  const services = defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string().max(160),
      order: z.number().default(0),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
  });
  ```

  **Blog**:
  ```typescript
  const blog = defineCollection({
    schema: z.object({
      title: z.string(),
      date: z.date(),
      updated: z.date().optional(),
      description: z.string().max(160),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
    }),
  });
  ```

  **Testimonials**:
  ```typescript
  const testimonials = defineCollection({
    schema: z.object({
      author: z.string(),
      car: z.string(),
      date: z.date(),
      rating: z.number().min(1).max(5).default(5),
    }),
  });
  ```
- **Acceptance**: `pnpm astro check` passes with collections recognized.

### Step 2.2: Create seed service content

- **Complexity**: S
- **Files**: `src/content/services/diagnostika-elektriki/index.md`
- **What**: Create a single seed service page with valid frontmatter matching the schema. Content can be 2-3 placeholder sentences in Russian. This validates the schema works at build time.
- **Acceptance**: `pnpm build` completes — Astro validates the frontmatter against the Zod schema during build.

### Step 2.3: Create seed blog post

- **Complexity**: S
- **Files**: `src/content/blog/primer-stati/index.md`
- **What**: Create a single seed blog post with valid frontmatter (title, date, description, tags). 2-3 placeholder paragraphs in Russian.
- **Acceptance**: `pnpm build` completes without schema validation errors.

### Step 2.4: Create seed testimonial

- **Complexity**: S
- **Files**: `src/content/testimonials/ivan-petrov.md`
- **What**: Create a single seed testimonial with valid frontmatter (author, car, date, rating). 1-2 sentences of review text in Russian.
- **Acceptance**: `pnpm build` completes without schema validation errors.

### Manual Testing — Phase 2

```
1. Run `pnpm build`
2. Verify: build completes with no content validation errors
3. Intentionally break a frontmatter field (e.g., remove required `title`)
4. Run `pnpm build` again — verify Zod schema error is reported clearly
5. Revert the intentional break
6. Run `pnpm astro check` — zero errors
```

---

## Phase 3: Base Layout & Global Styles

> **Goal**: Shared layout with header, footer, mobile sticky CTA bar, and design tokens. Every page will wrap in this layout. Site looks like a real skeleton (not unstyled HTML).

### New files to create

| File | Purpose |
|---|---|
| `src/styles/global.css` | CSS reset, design tokens, typography base |
| `src/styles/tokens.css` | CSS custom properties (colors, spacing, fonts) |
| `src/layouts/BaseLayout.astro` | HTML shell: `<head>`, meta tags, header, footer, slot |
| `src/components/Header.astro` | Site header: logo, phone CTA, nav, messenger links |
| `src/components/Footer.astro` | Site footer: contact info, service area, nav links |
| `src/components/MobileStickyBar.astro` | Fixed bottom bar on mobile: phone + WhatsApp buttons |
| `src/components/Logo.astro` | Site logo/brand name component |

### Step 3.1: Design tokens

- **Complexity**: S
- **Files**: `src/styles/tokens.css`
- **What**: Define CSS custom properties for the design system:
  - Colors: primary (BMW blue or a professional tone), text, background, accent, muted
  - Typography: font families (system-ui stack initially, self-hosted font can come later), sizes, line heights
  - Spacing scale: xs through xl
  - Layout: max-width, border-radius
  - Breakpoints: documented as comments (CSS custom properties can't be used in media queries)
- **Decision**: Start with a system font stack (`system-ui, -apple-system, sans-serif`). Self-hosted fonts are a follow-up task — they add complexity (font files, `@font-face`, FOUT handling) that shouldn't block scaffolding.
- **Acceptance**: File exists and is syntactically valid CSS.

### Step 3.2: Global CSS reset and typography

- **Complexity**: S
- **Files**: `src/styles/global.css`
- **What**: Minimal CSS reset (box-sizing, margin reset, img max-width) and base typography using the design tokens. Import `tokens.css`. Keep this file small — component styles go in scoped `<style>` blocks.
- **Acceptance**: File exists, imports tokens.

### Step 3.3: BaseLayout component

- **Complexity**: M
- **Files**: `src/layouts/BaseLayout.astro`
- **What**: Create the HTML shell that wraps every page:
  - `<html lang="ru">` — Russian language attribute
  - `<head>`: charset, viewport, title (from prop), meta description (from prop), canonical URL, OG tags (title, description, placeholder image), favicon link
  - `<body>`: imports global.css, renders `<Header />`, `<main><slot /></main>`, `<Footer />`, `<MobileStickyBar />`
  - Props: `title: string`, `description?: string`
- **SEO note**: Structured data (JSON-LD) for LocalBusiness is a follow-up task, not part of scaffolding.
- **Acceptance**: Layout renders when used by a page.

### Step 3.4: Header component

- **Complexity**: M
- **Files**: `src/components/Header.astro`
- **What**: Site header with:
  - Logo / site name (text for now, image logo is a follow-up)
  - Phone number as clickable `tel:` link with `aria-label`
  - WhatsApp and Telegram icon links (use inline SVG or text placeholders; actual icons are a follow-up)
  - Navigation: Главная, Услуги, Блог, Отзывы, О нас, Контакты
  - Mobile: hamburger menu is a follow-up — for scaffolding, a simple horizontal nav that wraps is fine
- **Accessibility**: `<nav>` element with `aria-label="Основная навигация"`, links have visible focus styles.
- **Acceptance**: Header renders with working navigation links.

### Step 3.5: Footer component

- **Complexity**: S
- **Files**: `src/components/Footer.astro`
- **What**: Site footer with:
  - Contact info block: phone, address (placeholder), working hours (placeholder)
  - Service area text: "Обслуживаем все районы Санкт-Петербурга"
  - Duplicate nav links for footer navigation
  - Copyright line with current year (computed in Astro frontmatter)
- **Acceptance**: Footer renders below main content.

### Step 3.6: MobileStickyBar component

- **Complexity**: S
- **Files**: `src/components/MobileStickyBar.astro`
- **What**: Fixed-position bar at the bottom of the screen, visible only on mobile (`display: none` on `min-width: 768px`):
  - "Позвонить" button → `tel:` link
  - "WhatsApp" button → `https://wa.me/...` link (placeholder number)
  - Both buttons: min 44px height (touch target), prominent styling
- **Zero JS**: This is pure CSS show/hide, no client-side JavaScript needed.
- **Acceptance**: Bar visible on mobile viewport, hidden on desktop.

### Step 3.7: Wire layout into index page

- **Complexity**: S
- **Files**: `src/pages/index.astro`
- **What**: Replace the scaffolded starter page with a minimal homepage that uses `BaseLayout`. Content is a single `<h1>` placeholder — the real homepage is a later feature.
- **Acceptance**: `pnpm dev` shows the page with header, footer, and mobile bar.

### Manual Testing — Phase 3

```
1. Run `pnpm dev`, open http://localhost:4321
2. Desktop (≥1024px):
   - Header visible with logo, phone number, messenger links, nav
   - Footer visible with contact info and nav
   - Sticky mobile bar is NOT visible
   - Click phone number — should trigger tel: dialog (or show link href)
   - All nav links visible (they'll 404 for now — that's expected)
3. Mobile (≤767px, use browser DevTools responsive mode):
   - Header adapts (nav wraps or collapses)
   - Sticky bar visible at bottom with phone and WhatsApp buttons
   - Touch targets are large enough (44px+)
   - No horizontal scrollbar
4. Accessibility:
   - Tab through the page — focus indicators visible on all links/buttons
   - Check `<html lang="ru">` in page source
   - Check `<nav>` has aria-label
5. View page source:
   - Verify NO <script> tags in the output (zero JS)
   - Verify <meta> tags present (title, description, viewport, charset)
6. Run `pnpm build` — verify clean build
```

---

## Phase 4: All Page Routes

> **Goal**: Every URL from the site map exists and renders with BaseLayout. Dynamic routes (`[slug]`) resolve from Content Collections. Navigating the site via header links works end-to-end.

### New files to create

| File | Purpose |
|---|---|
| `src/pages/uslugi/index.astro` | Services index — lists all services |
| `src/pages/uslugi/[slug].astro` | Dynamic service detail page |
| `src/pages/blog/index.astro` | Blog index — lists all posts |
| `src/pages/blog/[slug].astro` | Dynamic blog post page |
| `src/pages/otzyvy.astro` | Testimonials page |
| `src/pages/o-nas.astro` | About page |
| `src/pages/kontakty.astro` | Contact page |
| `src/layouts/ServiceLayout.astro` | Layout for individual service pages |
| `src/layouts/BlogPostLayout.astro` | Layout for individual blog posts |
| `src/components/ServiceCard.astro` | Card component for service listings |
| `src/components/BlogPostCard.astro` | Card component for blog listings |
| `src/components/TestimonialCard.astro` | Card component for testimonials |

### Step 4.1: ServiceCard component

- **Complexity**: S
- **Files**: `src/components/ServiceCard.astro`
- **What**: Card displaying a service: title, description, link to detail page. Image placeholder (gray box with CSS) — actual images are content-dependent.
- **Props**: `title: string`, `description: string`, `slug: string`
- **Acceptance**: Component renders with passed props.

### Step 4.2: Services index page

- **Complexity**: S
- **Files**: `src/pages/uslugi/index.astro`
- **What**: Fetches all services via `getCollection('services')`, filters out drafts, sorts by `order` field, renders a grid of `<ServiceCard>` components. Uses `BaseLayout` with appropriate title/description.
- **Acceptance**: Page at `/uslugi/` lists the seed service.

### Step 4.3: Service detail dynamic route

- **Complexity**: M
- **Files**: `src/pages/uslugi/[slug].astro`, `src/layouts/ServiceLayout.astro`
- **What**:
  - `[slug].astro`: Uses `getStaticPaths()` to generate a page per service. Fetches the entry and renders it inside `ServiceLayout`.
  - `ServiceLayout.astro`: Wraps `BaseLayout`, adds `<article>` with `<h1>` from frontmatter title, renders the markdown body via `<Content />`, and includes a CTA section ("Заказать звонок" button) below the content.
- **Slug mapping**: The directory name under `content/services/` becomes the slug (e.g., `diagnostika-elektriki` → `/uslugi/diagnostika-elektriki/`).
- **Acceptance**: `/uslugi/diagnostika-elektriki/` renders the seed service content.

### Step 4.4: BlogPostCard component

- **Complexity**: S
- **Files**: `src/components/BlogPostCard.astro`
- **What**: Card displaying a blog post: title, date (formatted in Russian locale), description, link to full post.
- **Props**: `title: string`, `date: Date`, `description: string`, `slug: string`
- **Acceptance**: Component renders with passed props, date formatted correctly.

### Step 4.5: Blog index page

- **Complexity**: S
- **Files**: `src/pages/blog/index.astro`
- **What**: Fetches all blog posts via `getCollection('blog')`, filters out drafts, sorts by date descending, renders a list/grid of `<BlogPostCard>` components.
- **Acceptance**: Page at `/blog/` lists the seed post.

### Step 4.6: Blog post dynamic route

- **Complexity**: M
- **Files**: `src/pages/blog/[slug].astro`, `src/layouts/BlogPostLayout.astro`
- **What**:
  - `[slug].astro`: Uses `getStaticPaths()` to generate a page per blog post.
  - `BlogPostLayout.astro`: Wraps `BaseLayout`, adds `<article>` semantics, renders `<h1>`, date, tags, markdown body, and a "back to blog" link.
- **Acceptance**: `/blog/primer-stati/` renders the seed blog post.

### Step 4.7: TestimonialCard component

- **Complexity**: S
- **Files**: `src/components/TestimonialCard.astro`
- **What**: Card displaying a testimonial: author name, car model, star rating (rendered as visual stars via CSS/unicode ★), review text.
- **Props**: `author: string`, `car: string`, `rating: number`, `body: string`
- **Acceptance**: Component renders with stars matching rating number.

### Step 4.8: Testimonials page

- **Complexity**: S
- **Files**: `src/pages/otzyvy.astro`
- **What**: Fetches all testimonials via `getCollection('testimonials')`, sorts by date descending, renders a list of `<TestimonialCard>` components. Includes a CTA section at the bottom.
- **Acceptance**: Page at `/otzyvy/` lists the seed testimonial.

### Step 4.9: About page

- **Complexity**: S
- **Files**: `src/pages/o-nas.astro`
- **What**: Static page using `BaseLayout`. Placeholder content sections: brief intro, experience, certifications (placeholder list), photo placeholder (gray box). All text is hardcoded for now — this page doesn't need a Content Collection (too few static pages to justify it).
- **Acceptance**: Page at `/o-nas/` renders.

### Step 4.10: Contact page

- **Complexity**: S
- **Files**: `src/pages/kontakty.astro`
- **What**: Static page using `BaseLayout`. Sections: phone number (clickable), address (placeholder), working hours, WhatsApp/Telegram links. Map embed is a follow-up (requires deciding on Yandex Maps vs static image). Callback form is a follow-up (needs Worker backend from a separate plan).
- **Acceptance**: Page at `/kontakty/` renders with contact info.

### Step 4.11: Update homepage

- **Complexity**: S
- **Files**: `src/pages/index.astro`
- **What**: Replace the Phase 3 placeholder with a homepage skeleton that has labeled sections:
  - Hero: headline + subtitle + "Заказать звонок" button (no form yet — button is non-functional placeholder)
  - Services: fetch and display top 3 services as `<ServiceCard>`
  - Testimonials: fetch and display latest 2-3 testimonials as `<TestimonialCard>`
  - CTA: "Свяжитесь с нами" section with phone and messenger links
- **Acceptance**: Homepage renders all sections with seed content.

### Manual Testing — Phase 4

```
1. Run `pnpm dev`, open http://localhost:4321
2. Navigation — click every link in the header:
   - / → Homepage with hero, services, testimonials, CTA sections
   - /uslugi/ → Services index listing seed service
   - /uslugi/diagnostika-elektriki/ → Service detail page with content
   - /blog/ → Blog index listing seed post
   - /blog/primer-stati/ → Blog post with content, date, tags
   - /otzyvy/ → Testimonials page with seed review
   - /o-nas/ → About page with placeholder content
   - /kontakty/ → Contact page with phone/messenger links
3. All navigation links work — no 404s for defined routes
4. Mobile viewport (≤767px):
   - All pages are readable, no horizontal scroll
   - Cards stack vertically
   - Sticky bar present on all pages
5. Verify semantic HTML on a service detail page:
   - <article> wrapping content
   - <h1> for the title (only one per page)
   - Headings in content start at <h2>
6. Verify blog post date displays in Russian format (e.g., "25 февраля 2026")
7. Run `pnpm build`:
   - Clean build
   - Check dist/ — verify HTML files exist for all routes including dynamic ones
8. Run `pnpm astro check` — zero errors
```

---

## Phase 5: Build Configuration & Production Readiness

> **Goal**: Project builds and deploys correctly on Cloudflare Pages. Linting configured. `.env.example` documents required variables.

### New files to create

| File | Purpose |
|---|---|
| `.env.example` | Documents environment variables (Telegram bot token, chat ID) |
| `wrangler.toml` | Cloudflare Pages project configuration (optional but useful for local dev with Workers later) |

### Existing files to modify

| File | Change description |
|---|---|
| `astro.config.mjs` | Verify site URL placeholder, sitemap config, trailing slashes |
| `package.json` | Add `preview` script, verify `build` script |
| `.gitignore` | Add `.wrangler/` directory |

### Step 5.1: Astro config finalization

- **Complexity**: S
- **Files**: `astro.config.mjs`
- **What**:
  - Set `site` to a placeholder URL (e.g., `https://example.com`) — required for sitemap generation. Will be updated when domain is chosen.
  - Set `trailingSlash: 'always'` — matches the URL structure in our architecture (all URLs end with `/`).
  - Verify sitemap integration is configured.
- **Acceptance**: `pnpm build` generates `sitemap-index.xml` in `dist/`.

### Step 5.2: Environment variables documentation

- **Complexity**: S
- **Files**: `.env.example`
- **What**: Document the environment variables that will be needed (not the values — those go in Cloudflare dashboard):
  ```
  # Telegram Bot (for callback form — used by Cloudflare Worker)
  TELEGRAM_BOT_TOKEN=
  TELEGRAM_CHAT_ID=

  # Site URL (used by Astro for canonical URLs and sitemap)
  SITE_URL=https://example.com
  ```
- **Acceptance**: File exists, `.env` is in `.gitignore`.

### Step 5.3: Package.json scripts

- **Complexity**: S
- **Files**: `package.json`
- **What**: Ensure these scripts exist:
  - `dev` — `astro dev`
  - `build` — `astro build`
  - `preview` — `astro preview` (serves the built site locally)
  - `check` — `astro check` (TypeScript validation)
- **Acceptance**: All four scripts run without errors.

### Step 5.4: Cloudflare Pages compatibility check

- **Complexity**: S
- **What**: Run `pnpm build` and verify the output:
  - `dist/` contains static HTML files for all routes
  - No server-side dependencies in the output (we're using `output: 'static'`)
  - Total `dist/` size is well under Cloudflare's 25MB per-file limit
  - Sitemap XML is generated
- **Acceptance**: Build output is a clean static site ready for Cloudflare Pages.

### Step 5.5: Update .gitignore

- **Complexity**: S
- **Files**: `.gitignore`
- **What**: Add `.wrangler/` (Cloudflare local dev artifacts) to gitignore.
- **Acceptance**: `.wrangler/` listed in `.gitignore`.

### Manual Testing — Phase 5

```
1. Run `pnpm build` — clean build, no warnings
2. Run `pnpm preview` — open http://localhost:4321
   - All routes work (same checks as Phase 4 but on the built output)
   - View source: HTML is production-quality (minified, no dev artifacts)
3. Check dist/ directory:
   - Verify: index.html, uslugi/index.html, blog/index.html, etc.
   - Verify: sitemap-index.xml exists and contains all URLs
   - Verify: no JavaScript bundles (zero JS baseline)
4. Run `pnpm check` — zero TypeScript errors
5. Verify .env.example exists and documents all future env vars
```

---

## NFR Considerations

### Performance
- Zero client-side JavaScript at the end of scaffolding — all components are Astro (server-rendered)
- System font stack avoids font loading delay; self-hosted fonts are a follow-up
- No images in scaffolding (placeholders via CSS) — no image weight to worry about yet
- CSS is scoped per component by Astro; global CSS limited to tokens and reset

### SEO
- `<html lang="ru">` on every page
- Unique `<title>` and `<meta name="description">` per page via BaseLayout props
- Canonical URL via Astro's `Astro.url`
- Open Graph meta tags (title, description) on every page
- Sitemap generated via `@astrojs/sitemap`
- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`, proper heading hierarchy
- Trailing slashes enforced consistently

### Accessibility
- `<html lang="ru">` for screen readers
- `<nav aria-label="...">` on header and footer navigation
- `aria-label` on icon-only links (phone, WhatsApp, Telegram)
- Visible focus indicators on all interactive elements
- Touch targets ≥44px on mobile CTA bar
- No motion/animation in scaffolding (can add with `prefers-reduced-motion` respect later)

### Mobile
- Mobile-first CSS (base styles = mobile, media queries for wider)
- Sticky CTA bar on mobile viewports
- No horizontal overflow at any viewport width
- Cards stack to single column on narrow screens

### Security
- No secrets committed (`.env` in `.gitignore`, `.env.example` documents shape only)
- No user input handling yet (callback form is a separate plan)
- CSP headers are a follow-up (configured in Cloudflare Pages `_headers` file)

---

## Open Questions

- [x] **Color palette**: Neutral professional palette to start, adjust later.
- [x] **Logo**: Text-only for now, no brand mark.
- [x] **Phone number**: Use placeholder `+7 (812) 000-00-00` for scaffolding.
- [x] **Messenger links**: Use placeholder URLs for WhatsApp and Telegram.

---

## Out of Scope (Follow-up Plans)

These are explicitly NOT part of scaffolding and will need their own feature documents and plans:

- [ ] Callback form (modal + Cloudflare Worker + Telegram bot)
- [ ] Tina CMS integration
- [ ] Self-hosted fonts
- [ ] Hamburger mobile menu
- [ ] Yandex Maps embed on contact page
- [ ] JSON-LD structured data (LocalBusiness, Article, Review)
- [ ] CSP and security headers (`_headers` file)
- [ ] OG image generation
- [ ] RSS feed for blog
- [ ] 404 page
- [ ] Real content authoring (actual service descriptions, blog posts, testimonials)
- [ ] Custom domain + Cloudflare Pages deployment setup
- [ ] Analytics (Cloudflare Web Analytics or Yandex.Metrika)
