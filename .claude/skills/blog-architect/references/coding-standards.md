# Coding Standards — medved-blog

Project-specific conventions for the Astro + TypeScript + Cloudflare Pages stack.

## Project Structure

```
src/
  components/       — Reusable Astro components (Header, Footer, ServiceCard, etc.)
  layouts/          — Page layouts (BaseLayout, BlogPostLayout, ServiceLayout)
  pages/            — Astro file-based routing (each .astro file = a route)
  styles/           — Global CSS (design tokens, reset, typography)
  utils/            — TypeScript helper functions
  types/            — Shared TypeScript interfaces/types
content/
  blog/             — Blog posts (markdown + co-located images)
  services/         — Service pages (markdown + co-located images)
  testimonials/     — Customer testimonials (markdown)
  pages/            — Static pages (about, etc.)
public/
  fonts/            — Self-hosted fonts
  images/           — Global images (logo, favicons, OG defaults)
functions/          — Cloudflare Pages Functions (Workers)
  api/
    callback.ts     — Callback form handler → Telegram
```

## Astro Components

### File structure

```astro
---
// 1. Imports (Astro components, then utilities, then types)
import BaseLayout from '../layouts/BaseLayout.astro';
import ServiceCard from '../components/ServiceCard.astro';
import type { CollectionEntry } from 'astro:content';

// 2. Props interface
interface Props {
  title: string;
  description?: string;
}

// 3. Data fetching and logic
const { title, description } = Astro.props;
const services = await getCollection('services');
---

<!-- 4. Template -->
<BaseLayout title={title}>
  <main>
    <h1>{title}</h1>
  </main>
</BaseLayout>

<!-- 5. Scoped styles -->
<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
```

### Naming

- Components: `PascalCase.astro` — `ServiceCard.astro`, `CallbackForm.astro`
- Layouts: `PascalCase.astro` with `Layout` suffix — `BaseLayout.astro`, `BlogPostLayout.astro`
- Pages: `kebab-case.astro` or `[slug].astro` for dynamic routes
- Utilities: `camelCase.ts` — `formatDate.ts`, `transliterate.ts`

### Islands (interactive components)

Only use `client:*` directives when the component genuinely needs client-side interactivity:

```astro
<!-- Good: form needs JS for submission and validation -->
<CallbackForm client:visible />

<!-- Bad: static content doesn't need hydration -->
<ServiceCard client:load />
```

Prefer `client:visible` over `client:load` for below-fold interactive elements.

## TypeScript

### Strictness

```jsonc
// tsconfig.json extends Astro's strict config
{
  "extends": "astro/tsconfigs/strict"
}
```

### Types over interfaces for simple shapes, interfaces for extensible contracts

```typescript
// Simple data shape
type ServiceMeta = {
  title: string;
  slug: string;
  order: number;
};

// Extensible contract
interface PageProps {
  title: string;
  description?: string;
}
```

### Content Collection access

Always use typed collection helpers:

```typescript
import { getCollection, getEntry } from 'astro:content';

// Filtered, typed collection
const publishedPosts = await getCollection('blog', ({ data }) => !data.draft);

// Single entry
const service = await getEntry('services', slug);
```

## CSS

### Design tokens via CSS custom properties

```css
/* src/styles/tokens.css */
:root {
  --color-primary: #1a56db;
  --color-text: #1f2937;
  --color-bg: #ffffff;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  --max-width: 1200px;
  --radius: 0.5rem;
}
```

### Mobile-first responsive design

```css
/* Base: mobile */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

/* Tablet+ */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop+ */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Scoped styles by default

Use Astro's built-in scoped `<style>` blocks. Only add to global CSS for:
- Design tokens and CSS custom properties
- CSS reset / normalize
- Typography base styles
- Utility classes (sparingly)

## Content

### Markdown conventions

- Frontmatter: all required fields must be present (enforced by Zod schema)
- Images: co-located in the same directory as the markdown file
- Headings: start at `##` in content (the `<h1>` comes from the page layout, not the markdown)
- Links: relative links between content pages

### URL structure (Russian, transliterated)

```
/                              → Главная
/uslugi/                       → Услуги (index)
/uslugi/diagnostika-elektriki/ → Service detail
/blog/                         → Блог (index)
/blog/kak-proverit-generator/  → Blog post
/otzyvy/                       → Отзывы
/o-nas/                        → О нас
/kontakty/                     → Контакты
```

## Cloudflare Workers (Functions)

### Location

Cloudflare Pages Functions live in `functions/` at project root. File path maps to route:
- `functions/api/callback.ts` → `POST /api/callback`

### Pattern

```typescript
// functions/api/callback.ts
interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // 1. Parse and validate input
  // 2. Rate limit check
  // 3. Send to Telegram
  // 4. Return JSON response
};
```

### Secrets

- Stored in Cloudflare Pages environment variables (dashboard or wrangler CLI)
- Never committed to Git
- Accessed via `context.env` in Workers
