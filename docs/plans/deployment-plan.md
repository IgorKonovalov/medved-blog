# Implementation Plan: Cloudflare Pages Deployment

> Created: 2026-02-28
> Status: draft

## Overview

Deploy the medved-blog site to Cloudflare Pages with custom domain `bmw-electric-spb.ru`. Includes pre-deployment hardening (robots.txt, security headers, favicon) and post-deployment verification (search console, Lighthouse).

## Current State

- Static Astro site builds cleanly (`yarn build` → `dist/`)
- `site` is set to `https://bmw-electric-spb.ru` in `astro.config.mjs`
- Sitemap generates at `dist/sitemap-index.xml`
- Custom 404 page at `dist/404.html`
- No `public/` directory yet (no robots.txt, no favicon, no `_headers`)
- No Cloudflare Pages project connected
- Domain `bmw-electric-spb.ru` registered at **reg.ru**
- No Cloudflare account yet — needs to be created

## Phases

| Phase | What it delivers | Complexity |
|---|---|---|
| 1 | Cloudflare account + GitHub connection | S |
| 2 | Pre-deployment assets (robots.txt, favicon, security headers) | S |
| 3 | Cloudflare Pages project + first deploy | S |
| 4 | DNS transfer from reg.ru to Cloudflare + custom domain + SSL | M |
| 5 | Post-deployment verification & search engine submission | S |

---

## Phase 1: Cloudflare Account Setup

> **Goal**: Create a Cloudflare account and connect the GitHub repo. This is a prerequisite for everything else.

### Step 1.1: Create Cloudflare account

- **Complexity**: S
- **What**: Go to https://dash.cloudflare.com/sign-up
  1. Sign up with email + password (or Google/Apple SSO)
  2. Verify email
  3. You land on the Cloudflare dashboard — no paid plan needed, free tier is sufficient
- **Acceptance**: Can log into https://dash.cloudflare.com.

### Step 1.2: Connect GitHub to Cloudflare

- **Complexity**: S
- **What**: Cloudflare Pages needs access to the GitHub repo to build on push:
  1. In Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
  2. Click **Connect GitHub**
  3. Authorize the Cloudflare Pages GitHub app
  4. Grant access to the `medved-blog` repository (can grant per-repo, not all repos)
  5. **Don't configure the project yet** — just authorize. We'll create the project in Phase 3 after pre-deployment assets are ready.
- **Acceptance**: GitHub connection shows as authorized in Cloudflare Pages.

---

## Phase 2: Pre-deployment Assets

> **Goal**: Create the static files that Cloudflare Pages serves alongside the built site — robots.txt, favicon, and security/cache headers.

### New files to create

| File | Purpose |
|---|---|
| `public/robots.txt` | Search engine crawling rules + sitemap reference |
| `public/favicon.svg` | Browser tab icon (simple SVG, no external font deps) |
| `public/_headers` | Cloudflare Pages custom headers (security, cache) |
| `public/_redirects` | HTTP→HTTPS and www→apex redirects (safety net) |

### Step 2.1: Create public/ directory and robots.txt

- **Complexity**: S
- **Files**: `public/robots.txt`
- **What**: Create `public/robots.txt` with:
  ```
  User-agent: *
  Allow: /
  Disallow: /admin/

  Sitemap: https://bmw-electric-spb.ru/sitemap-index.xml
  ```
  Note: `/admin/` is the Tina CMS editor (added in Tina CMS plan) — must not be indexed.
  Astro copies `public/` contents to `dist/` root at build time.
- **Acceptance**: `yarn build` → `dist/robots.txt` exists with correct sitemap URL.

### Step 2.2: Create favicon

- **Complexity**: S
- **Files**: `public/favicon.svg`
- **What**: Create a minimal SVG favicon — a simple wrench/bolt icon or the letter "M" (for "Медведь") in the primary brand color (`#1a56db`). SVG favicons are supported by all modern browsers and don't require multiple sizes.
- **Note**: `BaseLayout.astro` already has `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` — no layout changes needed.
- **Acceptance**: Browser tab shows the favicon during `yarn dev`.

### Step 2.3: Create Cloudflare Pages _headers file

- **Complexity**: S
- **Files**: `public/_headers`
- **What**: Cloudflare Pages reads `_headers` from the build output to apply custom response headers. Add security and cache headers:
  ```
  /*
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=()

  /_astro/*
    Cache-Control: public, max-age=31536000, immutable

  /blog/rss.xml
    Cache-Control: public, max-age=3600
    Content-Type: application/rss+xml; charset=utf-8
  ```
  Explanation:
  - `/*` — security headers on all pages
  - `/_astro/*` — Astro hashes asset filenames, so they're safe to cache forever (immutable)
  - RSS feed — cached for 1 hour
- **CSP note**: A full Content-Security-Policy header is deferred to a follow-up. Starting with these basic headers avoids breaking anything while still hardening the site.
- **Acceptance**: After deploy, `curl -I https://bmw-electric-spb.ru/` shows the security headers.

### Step 2.4: Create _redirects file

- **Complexity**: S
- **Files**: `public/_redirects`
- **What**: Cloudflare Pages `_redirects` for safety:
  ```
  https://www.bmw-electric-spb.ru/* https://bmw-electric-spb.ru/:splat 301
  ```
  This redirects `www.` to the apex domain. Cloudflare automatically handles HTTP→HTTPS, so no redirect needed for that.
- **Acceptance**: After deploy + DNS setup, `curl -I https://www.bmw-electric-spb.ru/` returns 301 to apex.

### Manual Testing — Phase 2

```
1. yarn build
2. Verify dist/ contains: robots.txt, favicon.svg, _headers, _redirects
3. yarn preview — open http://localhost:4321
4. Check favicon appears in browser tab
5. Navigate to /robots.txt — content is correct, sitemap URL matches
```

---

## Phase 3: Cloudflare Pages Project

> **Goal**: Create the Pages project and deploy. Site is live on the `*.pages.dev` subdomain.

### Step 3.1: Create Cloudflare Pages project

- **Complexity**: S
- **What**: In the Cloudflare dashboard:
  1. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
  2. Select the `medved-blog` GitHub repository (already authorized in Phase 1)
  3. Configure build settings:
     - **Framework preset**: Astro
     - **Build command**: `yarn build`
     - **Build output directory**: `dist`
     - **Root directory**: `/` (default)
     - **Node.js version**: `22` (matches `.nvmrc`)
  4. Set environment variables:
     - `NODE_VERSION` = `22` (Cloudflare Pages uses this to select Node version)
  5. Click **Save and Deploy**
- **Acceptance**: First build succeeds. Site is accessible at `https://medved-blog.pages.dev` (or similar).

### Step 3.2: Verify pages.dev deployment

- **Complexity**: S
- **What**: After the first deploy completes:
  1. Visit the `*.pages.dev` URL
  2. Navigate all routes: `/`, `/uslugi/`, `/blog/`, `/otzyvy/`, `/o-nas/`, `/kontakty/`
  3. Test a blog post with image: `/blog/primer-stati/`
  4. Test 404: visit a non-existent URL
  5. Check `/robots.txt` and `/sitemap-index.xml`
  6. Check `/blog/rss.xml`
  7. View page source — verify no broken asset references
- **Acceptance**: All routes work, images load, 404 page serves correctly, headers are present.

### Step 3.3: Set environment variables in Cloudflare

- **Complexity**: S
- **What**: In Cloudflare Pages project settings → Environment variables, add:
  - `TELEGRAM_BOT_TOKEN` (encrypted) — for future callback form Worker
  - `TELEGRAM_CHAT_ID` (plain) — for future callback form Worker
  These aren't used yet (callback form is a later feature), but setting them now avoids forgetting.
- **Acceptance**: Variables visible in dashboard (values encrypted).

---

## Phase 4: DNS Transfer from reg.ru to Cloudflare + Custom Domain

> **Goal**: Move DNS management from reg.ru to Cloudflare (free), then point `bmw-electric-spb.ru` to Cloudflare Pages. SSL auto-provisioned.

**Why transfer DNS to Cloudflare**: reg.ru does not support `CNAME` on apex domains (`bmw-electric-spb.ru` without `www`). Cloudflare supports "CNAME flattening" which solves this. Moving DNS to Cloudflare is free and gives the best performance (Cloudflare's DNS is one of the fastest globally). The domain stays registered at reg.ru — only DNS management moves.

### Step 4.1: Add domain to Cloudflare

- **Complexity**: S
- **What**: In the Cloudflare dashboard:
  1. Click **Add a site** (or **Add site** in the sidebar)
  2. Enter `bmw-electric-spb.ru`
  3. Select the **Free** plan → **Continue**
  4. Cloudflare scans existing DNS records — review the list and confirm
  5. Cloudflare shows **two nameservers** to use, e.g.:
     - `ada.ns.cloudflare.com`
     - `rick.ns.cloudflare.com`
  6. **Don't close this page** — you'll need these nameservers for the next step
- **Acceptance**: Domain appears in Cloudflare dashboard with "Pending Nameserver Update" status.

### Step 4.2: Change nameservers in reg.ru

- **Complexity**: S
- **What**: Log into https://www.reg.ru → go to your domain management:
  1. Find `bmw-electric-spb.ru` in your domains list
  2. Click **DNS-серверы / Управление** (DNS Servers / Management)
  3. Switch from reg.ru default DNS to **custom nameservers**
  4. Replace existing nameservers with the two Cloudflare nameservers from Step 4.1:
     - NS1: `ada.ns.cloudflare.com` (your actual value from Cloudflare)
     - NS2: `rick.ns.cloudflare.com` (your actual value from Cloudflare)
  5. Save changes
  6. **Wait**: DNS propagation takes 15 minutes to 24 hours (usually under 1 hour for .ru domains)
- **Important**: During propagation, the domain may briefly be unreachable. Since the site isn't live yet, this is a non-issue.
- **Acceptance**: Back in Cloudflare dashboard, domain status changes from "Pending" to **"Active"** (Cloudflare sends an email when this happens).

### Step 4.3: Add custom domain to Cloudflare Pages

- **Complexity**: S
- **What**: Once the domain is active on Cloudflare DNS:
  1. Go to **Workers & Pages** → select the `medved-blog` project
  2. **Custom domains** tab → **Set up a custom domain**
  3. Enter `bmw-electric-spb.ru` → Cloudflare auto-creates a CNAME record → **Activate domain**
  4. Repeat for `www.bmw-electric-spb.ru`
  5. SSL is provisioned automatically (Universal SSL, free) — may take a few minutes
- **Acceptance**: Both `bmw-electric-spb.ru` and `www.bmw-electric-spb.ru` listed as active custom domains.

### Step 4.4: Configure Cloudflare SSL and security settings

- **Complexity**: S
- **What**: In Cloudflare dashboard → domain `bmw-electric-spb.ru`:
  1. **SSL/TLS** → **Overview** → set mode to **Full (strict)**
  2. **SSL/TLS** → **Edge Certificates** → enable **Always Use HTTPS** (redirects HTTP→HTTPS)
  3. **SSL/TLS** → **Edge Certificates** → enable **Automatic HTTPS Rewrites**
  4. **Speed** → **Optimization** → enable **Auto Minify** for HTML, CSS, JS (small performance gain)
  5. **Caching** → verify **Browser Cache TTL** is set to "Respect Existing Headers" (our `_headers` file controls this)
- **Acceptance**: `curl -I http://bmw-electric-spb.ru/` returns 301 redirect to HTTPS.

### Step 4.5: Verify the live site

- **Complexity**: S
- **What**: After DNS propagation and SSL provisioning:
  1. `curl -I https://bmw-electric-spb.ru/` → `200 OK` with security headers from `_headers`
  2. `curl -I http://bmw-electric-spb.ru/` → `301` redirect to HTTPS
  3. `curl -I https://www.bmw-electric-spb.ru/` → `301` redirect to apex (from `_redirects`)
  4. Open in browser → padlock icon, site loads correctly
  5. Check canonical URLs in page source → `https://bmw-electric-spb.ru/...`
  6. Check `/sitemap-index.xml` → URLs use `https://bmw-electric-spb.ru`
- **Acceptance**: All access paths (http/https, www/apex) resolve correctly to `https://bmw-electric-spb.ru`.

---

## Phase 5: Post-deployment Verification

> **Goal**: Confirm the live site is production-ready. Submit to search engines.

### Step 5.1: Lighthouse audit

- **Complexity**: S
- **What**: Run Lighthouse in Chrome DevTools on the live site (at least homepage + one blog post):
  - **Performance**: Target 95+ (static site with zero JS should ace this)
  - **Accessibility**: Target 95+
  - **Best Practices**: Target 95+
  - **SEO**: Target 95+
- **Fix**: Address any issues scored below 90 before proceeding.
- **Acceptance**: All four categories score 90+ on mobile.

### Step 5.2: Submit to Yandex Webmaster

- **Complexity**: S
- **What**: Yandex is the primary search engine for Russian users:
  1. Go to https://webmaster.yandex.ru
  2. Add site `https://bmw-electric-spb.ru`
  3. Verify ownership (meta tag, DNS TXT record, or HTML file — Cloudflare DNS TXT is easiest)
  4. Submit sitemap: `https://bmw-electric-spb.ru/sitemap-index.xml`
  5. Set preferred region to "Санкт-Петербург" in site settings
- **Acceptance**: Site verified in Yandex Webmaster, sitemap submitted, region set.

### Step 5.3: Submit to Google Search Console

- **Complexity**: S
- **What**:
  1. Go to https://search.google.com/search-console
  2. Add property `https://bmw-electric-spb.ru`
  3. Verify ownership (DNS TXT record recommended — easy with Cloudflare DNS)
  4. Submit sitemap
  5. Request indexing on key pages (homepage, services, blog)
- **Acceptance**: Site verified in Google Search Console, sitemap submitted.

### Step 5.4: Functional smoke test on production

- **Complexity**: S
- **What**: Manual check of all critical paths on the live site:
  1. Homepage loads — hero, services, testimonials visible
  2. All navigation links work (no 404s)
  3. Blog post renders — image, tags, reading time, next/prev
  4. Tag page works — click a tag, see filtered posts
  5. RSS feed valid — open `/blog/rss.xml`
  6. Mobile — test on actual phone (or Chrome mobile emulation)
  7. Sticky CTA bar visible on mobile
  8. Phone `tel:` links trigger phone dialer
  9. WhatsApp link opens WhatsApp
  10. 404 page shows for `/nonexistent/`
- **Acceptance**: All checks pass.

---

## NFR Considerations

### Performance
- `_headers` sets immutable cache on `/_astro/*` assets — repeat visitors get instant loads
- Zero JS means nothing to download/parse/execute on client
- Cloudflare CDN serves from edge nodes in Russia (Saint Petersburg users get low latency)

### SEO
- `robots.txt` points crawlers to sitemap
- Yandex Webmaster + Google Search Console ensure indexing
- Region set to Saint Petersburg in Yandex for local SEO
- Canonical URLs and sitemap all point to the real domain

### Security
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- HTTPS enforced by Cloudflare
- No secrets in frontend code

### Mobile
- No changes to site — all mobile optimizations already in place from scaffolding

---

## Resolved Questions

- [x] **DNS provider**: Domain registered at **reg.ru**. reg.ru does not support CNAME on apex → DNS will be transferred to Cloudflare (free). Domain stays registered at reg.ru.
- [x] **Cloudflare account**: No account yet → Phase 1 covers account creation.
- [x] **Content-Security-Policy**: Deferred — CSP can break Tina CMS admin, embedded maps, and other future features. Basic security headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.) are included now.

---

## Follow-up Tasks (Out of Scope)

- [ ] Full Content-Security-Policy header (after all features are integrated)
- [ ] Cloudflare Web Analytics or Yandex.Metrika
- [ ] Automatic performance monitoring (Lighthouse CI on PRs)
- [ ] PR preview deployments testing workflow
- [ ] Custom email on the domain (e.g., info@bmw-electric-spb.ru via Cloudflare Email Routing)
