# Implementation Plan: Blog Full Implementation

> Source: continuation of project scaffolding
> Created: 2026-02-28
> Status: draft

## Overview

Take the blog from its scaffolded state (one seed post, basic index and detail pages) to a fully-featured blog with hero images, tag navigation, RSS feed, reading time, post navigation, SEO structured data, and a custom 404 page. Also sets the real domain `bmw-electric-spb.ru` across the project.

## Current State

The scaffolding plan is **complete**. What exists today:

- Blog collection schema in `src/content.config.ts` (title, date, updated, description, tags, draft, image, imageAlt)
- Blog index at `/blog/` — lists all posts sorted by date, filters drafts
- Blog post detail at `/blog/[slug]/` — renders markdown with title, date, tag pills
- `BlogPostCard` component (title, date, description, link)
- `BlogPostLayout` (wraps BaseLayout, article semantics, "Все статьи" back link)
- One seed post: `primer-stati/index.md`
- Site URL is still `https://example.com`

## Phases

| Phase | What it delivers | Complexity |
|---|---|---|
| 1 | Real domain config + .env update | S |
| 2 | Hero images (BMW stock photos, display in posts and cards) | M |
| 3 | Tag system (clickable tags, tag pages, template-based SEO) | M |
| 4 | Blog UX improvements (reading time, next/prev, updated date) | M |
| 5 | RSS feed | S |
| 6 | Blog SEO (JSON-LD Article, OG improvements) | M |
| 7 | Custom 404 page | S |

---

## Phase 1: Domain Configuration

> **Goal**: Set the real domain `bmw-electric-spb.ru` everywhere. Sitemap and canonical URLs become correct.

### Existing files to modify

| File | Change description |
|---|---|
| `astro.config.mjs` | Change `site` from `https://example.com` to `https://bmw-electric-spb.ru` |
| `.env.example` | Update `SITE_URL` to `https://bmw-electric-spb.ru` |
| `docs/architecture/blog-stack-decisions.md` | Note the domain decision in the project |

### Step 1.1: Update Astro site URL

- **Complexity**: S
- **Files**: `astro.config.mjs`
- **What**: Change `site: 'https://example.com'` to `site: 'https://bmw-electric-spb.ru'`.
- **Acceptance**: `yarn build` generates `sitemap-index.xml` with URLs under `bmw-electric-spb.ru`. Canonical URL in page source points to the real domain.

### Step 1.2: Update environment template

- **Complexity**: S
- **Files**: `.env.example`
- **What**: Change `SITE_URL=https://example.com` to `SITE_URL=https://bmw-electric-spb.ru`.
- **Acceptance**: File reflects the real domain.

### Step 1.3: Document domain in architecture

- **Complexity**: S
- **Files**: `docs/architecture/blog-stack-decisions.md`
- **What**: Add the chosen domain `bmw-electric-spb.ru` to the Requirements section (replace "Domain: To be decided later").
- **Acceptance**: Architecture doc reflects reality.

---

## Phase 2: Hero Images

> **Goal**: Blog posts and service pages display hero images. Use free BMW stock photos from Unsplash, downloaded and co-located with content (per project convention). Blog post cards on the index page show image thumbnails.

### New files to create

| File | Purpose |
|---|---|
| `src/content/blog/primer-stati/hero.jpg` | Hero image for the seed blog post (BMW photo) |
| `src/content/services/diagnostika-elektriki/hero.jpg` | Hero image for the seed service page (BMW photo) |

### Existing files to modify

| File | Change description |
|---|---|
| `src/layouts/BlogPostLayout.astro` | Display hero image above article title when `image` is set |
| `src/layouts/ServiceLayout.astro` | Display hero image above article title when `image` is set |
| `src/components/BlogPostCard.astro` | Show image thumbnail when available |
| `src/components/ServiceCard.astro` | Replace CSS placeholder with actual image when available |
| `src/content/blog/primer-stati/index.md` | Add `image` and `imageAlt` to frontmatter |
| `src/content/services/diagnostika-elektriki/index.md` | Add `image` and `imageAlt` to frontmatter |
| `astro.config.mjs` | Add `image` config if needed for Astro's built-in image optimization |

### Image Strategy

- **Source**: Download free-to-use BMW car photos from Unsplash (royalty-free, no attribution required for web use)
- **Storage**: Co-located with their markdown file in the same directory (per project convention from `blog-stack-decisions.md`)
- **Optimization**: Use Astro's built-in `<Image>` component from `astro:assets` — automatic format conversion (WebP/AVIF), resizing, and lazy loading
- **Sizes**: Download originals at ~1200px wide; Astro will generate responsive sizes
- **Alt text**: Stored in frontmatter `imageAlt` field (Russian)
- **Fallback**: Components gracefully handle missing images (no broken layout if `image` is not set)

### Step 2.1: Download BMW stock photos

- **Complexity**: S
- **What**: Download 2-3 free BMW car photos from Unsplash. Save as:
  - `src/content/blog/primer-stati/hero.jpg` — a BMW engine bay or dashboard (relates to generator article)
  - `src/content/services/diagnostika-elektriki/hero.jpg` — a BMW with hood open or diagnostic equipment
- **Acceptance**: Images exist in the content directories, each under 500KB.

### Step 2.2: Update seed content frontmatter

- **Complexity**: S
- **Files**: `src/content/blog/primer-stati/index.md`, `src/content/services/diagnostika-elektriki/index.md`
- **What**: Add `image` and `imageAlt` fields to frontmatter:
  ```yaml
  image: ./hero.jpg
  imageAlt: Двигатель BMW с открытым капотом
  ```
- **Acceptance**: `yarn build` passes — Zod schema validates the optional image fields.

### Step 2.3: Update Content Collection schema for image imports

- **Complexity**: S
- **Files**: `src/content.config.ts`
- **What**: The current schema uses `z.string().optional()` for `image`. For Astro's `<Image>` component to work with co-located images, the schema should use `image()` helper from Astro's content layer:
  ```typescript
  image: image().optional(),
  ```
  This enables Astro to resolve the relative `./hero.jpg` path and optimize it at build time.
- **Note**: Check Astro 5.x docs — the `image()` helper may need to be imported from `astro:content` or `astro/zod`. If `image()` is not available or causes issues with the glob loader, keep `z.string()` and use a manual `<img>` tag with the public path instead.
- **Acceptance**: `yarn build` resolves image paths and generates optimized versions.

### Step 2.4: Display hero image in BlogPostLayout

- **Complexity**: M
- **Files**: `src/layouts/BlogPostLayout.astro`
- **What**: Add optional `image` and `imageAlt` props. When provided, render the hero image above the `<h1>` inside the article:
  ```astro
  {image && (
    <Image src={image} alt={imageAlt || ''} width={960} class="hero-image" loading="eager" />
  )}
  ```
  - Use `loading="eager"` since hero images are above the fold.
  - Style: full content width, border-radius, margin-bottom.
  - If `image` is not set, nothing renders (no broken placeholder).
- **Acceptance**: Blog post with hero image shows the optimized photo above the title.

### Step 2.5: Display hero image in ServiceLayout

- **Complexity**: S
- **Files**: `src/layouts/ServiceLayout.astro`
- **What**: Same pattern as BlogPostLayout — add optional `image`/`imageAlt` props, display above `<h1>`.
- **Acceptance**: Service page with hero image shows the photo.

### Step 2.6: Add image thumbnail to BlogPostCard

- **Complexity**: S
- **Files**: `src/components/BlogPostCard.astro`
- **What**: Add optional `image` and `imageAlt` props. When provided, display a small thumbnail (e.g., 280×160 via Astro `<Image>` with `width` and `height` set) above the date/title/description. Use `loading="lazy"` for card images (below fold on index pages). When no image, card looks the same as before (no empty space).
- **Files to update**: `src/pages/blog/index.astro` — pass `image={post.data.image}` and `imageAlt={post.data.imageAlt}` to BlogPostCard.
- **Acceptance**: Blog index shows thumbnails on cards that have images.

### Step 2.7: Add image to ServiceCard

- **Complexity**: S
- **Files**: `src/components/ServiceCard.astro`
- **What**: Replace the current CSS gray placeholder with an actual `<Image>` when the image prop is available. When no image, keep the gray placeholder. Update `src/pages/uslugi/index.astro` and `src/pages/index.astro` to pass image data.
- **Acceptance**: Service cards show real images when available, placeholder when not.

### Manual Testing — Phase 2

```
1. Run `yarn dev`
2. /blog/primer-stati/ — hero image displays above the title
   - Image is optimized (check Network tab — served as WebP/AVIF)
   - Image has correct alt text
   - Image is responsive (doesn't overflow on mobile)
3. /uslugi/diagnostika-elektriki/ — hero image displays
4. /blog/ — blog post card shows thumbnail
5. /uslugi/ — service card shows image instead of gray placeholder
6. / — homepage service cards and blog cards show images
7. Remove image from frontmatter temporarily:
   - Verify pages still render without broken layout
8. yarn build — verify optimized images in dist/_astro/
9. Lighthouse check on blog post: image is correctly sized, lazy loading on cards
```

---

## Phase 3: Tag System

> **Goal**: Tags on blog posts become clickable links leading to filtered tag pages. Users can browse posts by topic.

### New files to create

| File | Purpose |
|---|---|
| `src/pages/blog/tag/[tag].astro` | Dynamic tag page — lists posts matching a tag |
| `src/components/TagList.astro` | Reusable tag pill list (clickable links) |

### Existing files to modify

| File | Change description |
|---|---|
| `src/layouts/BlogPostLayout.astro` | Replace inline tag rendering with `TagList` component |
| `src/components/BlogPostCard.astro` | Add optional tags display |
| `src/pages/blog/index.astro` | Pass tags to BlogPostCard; optionally show tag cloud/filter |

### Component Breakdown

| Component | Type | Props | Notes |
|---|---|---|---|
| `TagList` | Astro | `tags: string[]`, `size?: 'sm' \| 'md'` | Renders tag pills as links to `/blog/tag/{tag}/` |

### Step 3.1: TagList component

- **Complexity**: S
- **Files**: `src/components/TagList.astro`
- **What**: Create a reusable component that renders an array of tags as a horizontal flex list. Each tag is an `<a>` linking to `/blog/tag/{tagSlug}/`. Tags are displayed as styled pills. Accept a `size` prop to control font size (used smaller in cards, normal in post layout).
- **Tag slug**: Tags are already in Russian — use them as-is in URLs via `encodeURIComponent()` for safety, but since Astro's `getStaticPaths` handles encoding, we just pass the raw tag string as the path param.
- **Acceptance**: Component renders clickable tag pills.

### Step 3.2: Tag page (dynamic route)

- **Complexity**: M
- **Files**: `src/pages/blog/tag/[tag].astro`
- **What**: Create a dynamic route that generates one page per unique tag across all blog posts. Use `getStaticPaths()` to collect all unique tags from blog entries. Each page lists posts matching that tag, sorted by date descending, using `BlogPostCard`. Include a heading like "Статьи по теме: {tag}" and a link back to `/blog/`.
- **Meta description**: Template-based — `Статьи по теме «{tag}» — блог автоэлектрика BMW в Санкт-Петербурге`. Pass to BaseLayout.
- **Implementation**:
  ```
  getStaticPaths() {
    - getCollection('blog'), filter non-draft
    - Collect Set of all tags across all posts
    - For each tag: { params: { tag }, props: { posts: filtered posts } }
  }
  ```
- **Acceptance**: `/blog/tag/генератор/` shows posts tagged "генератор" with a proper meta description. Non-existent tags are not generated (no empty pages).

### Step 3.3: Wire TagList into BlogPostLayout

- **Complexity**: S
- **Files**: `src/layouts/BlogPostLayout.astro`
- **What**: Replace the current inline `<ul class="post-tags">` rendering with the new `<TagList>` component. Remove the now-redundant tag styles from the layout's `<style>` block.
- **Acceptance**: Tags on blog post pages are now clickable links to tag pages.

### Step 3.4: Add tags to BlogPostCard

- **Complexity**: S
- **Files**: `src/components/BlogPostCard.astro`
- **What**: Add optional `tags` prop. When tags are provided, render `<TagList tags={tags} size="sm" />` below the description. Keep it minimal — max 3 tags shown, rest hidden (to avoid card bloat).
- **Files to update**: `src/pages/blog/index.astro` — pass `tags={post.data.tags}` to BlogPostCard.
- **Acceptance**: Blog index cards show clickable tags.

### Manual Testing — Phase 3

```
1. Run `yarn dev`
2. /blog/ — cards show tags as clickable pills
3. Click a tag → navigates to /blog/tag/{tag}/
4. Tag page shows correct heading and filtered posts
5. Tag page meta description follows template: "Статьи по теме «{tag}» — ..."
6. Tag page has "back to blog" link
7. /blog/primer-stati/ — tags in post header are clickable
8. yarn build — all tag pages generated in dist/
9. npx astro check — zero errors
```

---

## Phase 4: Blog UX Improvements

> **Goal**: Add reading time, next/previous post navigation, and "updated" date display. These small touches make the blog feel complete and professional.

### New files to create

| File | Purpose |
|---|---|
| `src/utils/readingTime.ts` | Utility to calculate reading time from markdown body |

### Existing files to modify

| File | Change description |
|---|---|
| `src/layouts/BlogPostLayout.astro` | Add reading time, updated date, next/prev navigation |
| `src/pages/blog/[slug].astro` | Compute reading time and next/prev posts, pass as props |
| `src/components/BlogPostCard.astro` | Add optional reading time display |

### Step 4.1: Reading time utility

- **Complexity**: S
- **Files**: `src/utils/readingTime.ts`
- **What**: Create a function `getReadingTime(text: string): number` that returns estimated minutes. Algorithm: strip markdown syntax, count words, divide by 200 (average Russian reading speed is ~200 wpm), round up to nearest integer. Min 1 minute.
- **No external dependencies** — this is a simple word count, no need for a library.
- **Acceptance**: `getReadingTime("слово ".repeat(400))` returns `2`.

### Step 4.2: Add reading time to blog post page

- **Complexity**: S
- **Files**: `src/pages/blog/[slug].astro`, `src/layouts/BlogPostLayout.astro`
- **What**:
  - In `[slug].astro`: import `getReadingTime`, read the raw markdown body from the entry, compute reading time, pass it as a prop to `BlogPostLayout`.
  - In `BlogPostLayout.astro`: add `readingTime?: number` to Props. Display next to the date in post-meta: "5 мин. чтения".
- **Note**: Astro Content Collections provide `entry.body` as the raw markdown string — use that for word counting.
- **Acceptance**: Blog post shows "X мин. чтения" in the meta section.

### Step 4.3: Display "updated" date

- **Complexity**: S
- **Files**: `src/layouts/BlogPostLayout.astro`, `src/pages/blog/[slug].astro`
- **What**: Add `updated?: Date` to BlogPostLayout props. When present, display "Обновлено: {formatted date}" below the publication date. Pass `entry.data.updated` from `[slug].astro`.
- **Acceptance**: Posts with `updated` frontmatter show both dates. Posts without show only the original date.

### Step 4.4: Next/Previous post navigation

- **Complexity**: M
- **Files**: `src/pages/blog/[slug].astro`, `src/layouts/BlogPostLayout.astro`
- **What**:
  - In `[slug].astro`: within `getStaticPaths()`, sort all non-draft posts by date. For each post, determine the previous and next posts in chronological order. Pass `prevPost` and `nextPost` (each with `title` and `slug`, or `null`) as props.
  - In `BlogPostLayout.astro`: add `prevPost` and `nextPost` optional props. Render a navigation section in the post footer with "← Предыдущая" and "Следующая →" links. If only one direction exists, show only that link.
- **Acceptance**: Bottom of a blog post shows navigation links to adjacent posts. First and last posts show only one direction.

### Manual Testing — Phase 4

```
1. Run `yarn dev`
2. /blog/primer-stati/ — verify:
   - Reading time appears (e.g., "1 мин. чтения")
   - Date formatted correctly
   - If updated date set in frontmatter, both dates shown
3. Add a second seed post (for testing next/prev navigation):
   - Create src/content/blog/vtoraya-statya/index.md with valid frontmatter
   - Verify next/prev links appear on both posts
4. Mobile viewport — reading time and navigation don't break layout
5. yarn build — clean
6. npx astro check — zero errors
```

---

## Phase 5: RSS Feed

> **Goal**: Blog has an RSS feed at `/blog/rss.xml` so readers can subscribe.

### New files to create

| File | Purpose |
|---|---|
| `src/pages/blog/rss.xml.ts` | RSS feed endpoint |

### Existing files to modify

| File | Change description |
|---|---|
| `package.json` | Add `@astrojs/rss` dependency |
| `src/layouts/BaseLayout.astro` | Add RSS `<link>` tag in `<head>` |

### Step 5.1: Install @astrojs/rss

- **Complexity**: S
- **What**: Run `yarn add @astrojs/rss`. This is Astro's official RSS helper — generates valid RSS XML from a list of items.
- **Acceptance**: Package in `package.json` dependencies.

### Step 5.2: Create RSS endpoint

- **Complexity**: S
- **Files**: `src/pages/blog/rss.xml.ts`
- **What**: Create an Astro endpoint that:
  1. Imports `rss` from `@astrojs/rss`
  2. Fetches all non-draft blog posts via `getCollection('blog')`
  3. Sorts by date descending
  4. Returns `rss()` with:
     - `title`: "Блог — автоэлектрик BMW СПб"
     - `description`: "Статьи о диагностике и ремонте электрики BMW"
     - `site`: `import.meta.env.SITE`
     - `items`: mapped from posts (title, pubDate, description, link)
- **Acceptance**: `/blog/rss.xml` returns valid RSS XML. Validate with an RSS validator.

### Step 5.3: Add RSS discovery link

- **Complexity**: S
- **Files**: `src/layouts/BaseLayout.astro`
- **What**: Add `<link rel="alternate" type="application/rss+xml" title="Блог — автоэлектрик BMW" href="/blog/rss.xml" />` to the `<head>`. This enables RSS auto-discovery in browsers and feed readers.
- **Acceptance**: RSS icon appears in browser address bar (Firefox) or feed readers discover the feed automatically.

### Manual Testing — Phase 5

```
1. yarn build
2. Verify dist/blog/rss.xml exists
3. Open /blog/rss.xml in browser — valid XML with post entries
4. Check <head> in any page source — RSS link tag present
5. Paste the feed URL into a feed validator (e.g., validator.w3.org/feed)
```

---

## Phase 6: Blog SEO Enhancements

> **Goal**: Blog posts emit JSON-LD Article structured data and improved Open Graph tags. This helps Google display rich results (article snippets with dates) and social media show proper previews.

### New files to create

| File | Purpose |
|---|---|
| `src/components/ArticleJsonLd.astro` | JSON-LD structured data component for blog posts |

### Existing files to modify

| File | Change description |
|---|---|
| `src/layouts/BaseLayout.astro` | Accept optional `og:type` override, optional `og:image`, article-specific OG tags slot |
| `src/layouts/BlogPostLayout.astro` | Pass article-specific OG and JSON-LD data to BaseLayout |

### Step 6.1: ArticleJsonLd component

- **Complexity**: M
- **Files**: `src/components/ArticleJsonLd.astro`
- **What**: Create a component that renders a `<script type="application/ld+json">` tag with [Article schema](https://schema.org/Article):
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "...",
    "description": "...",
    "datePublished": "2026-02-20",
    "dateModified": "...",
    "author": {
      "@type": "Organization",
      "name": "Медведь — автоэлектрик BMW"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Медведь — автоэлектрик BMW"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://bmw-electric-spb.ru/blog/..."
    }
  }
  ```
- **Props**: `title`, `description`, `datePublished: string`, `dateModified?: string`, `url: string`, `image?: string`
- **Zero JS**: This is a server-rendered `<script>` tag with JSON content — no client-side JS.
- **Acceptance**: Google Rich Results Test validates the structured data.

### Step 6.2: Enhance BaseLayout with OG flexibility

- **Complexity**: S
- **Files**: `src/layouts/BaseLayout.astro`
- **What**: Add optional props to BaseLayout:
  - `ogType?: string` (default: `'website'`, blog posts pass `'article'`)
  - `ogImage?: string` (absolute URL to OG image)
  - `articleMeta?: { publishedTime: string; modifiedTime?: string; tags?: string[] }`
  - Add a `<slot name="head" />` for child layouts to inject extra `<head>` content (like JSON-LD)
- **When `ogType` is `'article'`**, also render:
  - `<meta property="article:published_time" content="..." />`
  - `<meta property="article:modified_time" content="..." />` (if provided)
  - `<meta property="article:tag" content="..." />` (one per tag)
- **Acceptance**: Blog post pages have `og:type=article` and article-specific meta tags.

### Step 6.3: Wire SEO into BlogPostLayout

- **Complexity**: S
- **Files**: `src/layouts/BlogPostLayout.astro`, `src/pages/blog/[slug].astro`
- **What**:
  - In `BlogPostLayout.astro`: pass `ogType="article"`, `articleMeta`, and `ogImage` (if image exists) to BaseLayout. Render `<ArticleJsonLd>` in the `head` slot.
  - In `[slug].astro`: pass `entry.data.image` and computed data to layout.
- **Acceptance**: View source of a blog post — JSON-LD and article meta tags present.

### Manual Testing — Phase 6

```
1. yarn build
2. View source of a blog post page:
   - og:type is "article"
   - article:published_time meta tag present
   - JSON-LD script block with Article schema
3. Paste the page URL into Google Rich Results Test → validates
4. Paste into Facebook Sharing Debugger → shows correct title/description/type
5. No <script> tags besides the JSON-LD (still zero JS)
6. npx astro check — zero errors
```

---

## Phase 7: Custom 404 Page

> **Goal**: Visitors hitting a broken link see a helpful Russian-language 404 page instead of the default Cloudflare/browser error.

### New files to create

| File | Purpose |
|---|---|
| `src/pages/404.astro` | Custom 404 error page |

### Step 7.1: Create 404 page

- **Complexity**: S
- **Files**: `src/pages/404.astro`
- **What**: Create a simple 404 page using `BaseLayout` with:
  - `<h1>Страница не найдена</h1>`
  - Brief text: "Запрашиваемая страница не существует или была перемещена."
  - Links to homepage and blog: "Перейти на главную" and "Читать блог"
  - Centered layout, not too tall
- **SEO**: `<meta name="robots" content="noindex">` to prevent indexing.
- **Cloudflare Pages**: Automatically serves `404.html` for missing routes when using static output.
- **Acceptance**: `yarn build` produces `dist/404.html`. Navigating to a non-existent URL on the deployed site shows the custom page.

### Manual Testing — Phase 7

```
1. yarn build — verify dist/404.html exists
2. yarn preview — navigate to /nonexistent-page/
3. Verify: custom 404 page with Russian text and navigation links
4. Verify: page source has noindex meta tag
5. Page uses BaseLayout — header/footer/mobile bar present
```

---

## NFR Considerations

### Performance
- **Zero JS maintained** — all new features are server-rendered Astro components. JSON-LD is a static `<script type="application/ld+json">`, not executable JS.
- **RSS is a build-time endpoint** — no runtime cost.
- **Reading time computed at build time** — no client-side calculation.
- **No new dependencies except `@astrojs/rss`** (official Astro integration, tiny).

### SEO
- **Real domain** in sitemap, canonical URLs, and OG tags.
- **JSON-LD Article** on every blog post — enables Google rich snippets (article with date).
- **article:published_time / modified_time** OG tags for social sharing.
- **RSS feed with auto-discovery** — feed readers find the blog automatically.
- **Tag pages** create topical landing pages — each tag page is a crawlable URL that groups related content.
- **404 page** with `noindex` — clean error handling, no wasted crawl budget.

### Accessibility
- **Tag links** — keyboard-focusable, visible focus styles (inherited from global.css).
- **Reading time** — displayed as plain text, no icon-only presentation.
- **Next/prev navigation** — uses `<nav>` with `aria-label="Навигация по статьям"`.
- **404 page** — clear text and obvious navigation links.

### Mobile
- **Tag pills** — flex-wrap so they stack on narrow screens, touch targets ≥44px height.
- **Next/prev links** — stack vertically on mobile (one per row, full-width tappable area).
- **RSS link** — `<link>` tag only, no visible UI element needed.

### Security
- **No user input** in any of these features — all server-rendered at build time.
- **JSON-LD content** is escaped via `JSON.stringify()` — no XSS from frontmatter.

---

## Resolved Questions

- [x] **Blog post images**: Yes — display hero images using free BMW stock photos from Unsplash, co-located with content. Added as Phase 2.
- [x] **Tag page SEO**: Template-based meta descriptions: `Статьи по теме «{tag}» — блог автоэлектрика BMW в Санкт-Петербурге`.
- [x] **Pagination**: Deferred — revisit when 15+ posts exist. Not part of this plan.

---

## Follow-up Tasks (Out of Scope)

- [ ] Blog post hero images (display in layout + OG image)
- [ ] Blog pagination (when post count exceeds ~15)
- [ ] Blog search (likely not needed at scale <100 posts)
- [ ] Tina CMS integration for blog editing
- [ ] OG image auto-generation (per-post social cards)
- [ ] Yandex.Metrika / Cloudflare Web Analytics
- [ ] Cloudflare Pages deployment with custom domain `bmw-electric-spb.ru`
- [ ] Content authoring guide for blog writers
