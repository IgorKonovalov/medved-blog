# medved-blog

Service website and blog for a BMW auto electrician based in Saint Petersburg. Built with Astro, hosted on Cloudflare Pages.

**Live site**: https://bmw-electric-spb.ru

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro](https://astro.build/) 5 (static output, zero JS by default) |
| Language | TypeScript (strict) |
| Content | Markdown + Astro Content Collections (Zod schemas) |
| CMS | Tina CMS (visual editing, git-based) |
| Hosting | Cloudflare Pages |
| Forms | Cloudflare Workers → Telegram Bot (planned) |
| Package manager | yarn |

## Getting Started

```bash
yarn install
yarn dev            # Dev server at http://localhost:4321
yarn dev:cms        # Dev server + Tina CMS editor at http://localhost:4321/admin/
yarn build          # Production build to dist/
yarn build:cms:prod # Production build with Tina admin (used by Cloudflare Pages)
yarn preview        # Preview production build locally
yarn check          # TypeScript and Astro validation
```

## Content Editing

Content writers use the Tina CMS visual editor:

- **Production**: https://bmw-electric-spb.ru/admin/ (login via GitHub, requires Tina Cloud invite)
- **Local**: run `yarn dev:cms`, then open http://localhost:4321/admin/

Content is stored as markdown files in `src/content/` and committed to Git. Images go in `public/images/`.

## Project Structure

```
src/
  components/     # Reusable Astro components (PascalCase)
  layouts/        # Page layouts (PascalCase + Layout suffix)
  pages/          # File-based routing (kebab-case)
  styles/         # Global CSS (tokens, reset, typography)
  content/        # Content Collections (blog, services, testimonials)
  content.config.ts  # Zod schemas for content collections
public/
  images/         # Content images (served as-is, referenced from markdown)
tina/
  config.ts       # Tina CMS schema (keep in sync with content.config.ts)
docs/
  architecture/   # Stack decisions and ADRs
  plans/          # Implementation plans
```

## Content Collections

- **blog** — SEO articles and guides (`src/content/blog/{slug}/index.md`)
- **services** — Service pages (`src/content/services/{slug}/index.md`)
- **testimonials** — Customer reviews (`src/content/testimonials/*.md`)

## URL Structure

All URLs use transliterated Russian slugs:

```
/                              # Homepage
/uslugi/                       # Services index
/uslugi/diagnostika-elektriki/ # Service detail
/blog/                         # Blog index
/blog/kak-proverit-generator/  # Blog post
/otzyvy/                       # Testimonials
/o-nas/                        # About
/kontakty/                     # Contact
```

## Environment Variables

Copy `.env.example` and fill in values for local development:

```bash
cp .env.example .env
```

| Variable | Required for |
|---|---|
| `TINA_CLIENT_ID` | Production CMS editing (build-time) |
| `TINA_TOKEN` | Production CMS editing (build-time) |
| `TELEGRAM_BOT_TOKEN` | Callback form Worker (planned) |
| `TELEGRAM_CHAT_ID` | Callback form Worker (planned) |

Production secrets are stored in Cloudflare Pages dashboard, never committed.

## Documentation

- [Stack Decisions](docs/architecture/blog-stack-decisions.md) — architecture decisions with rationale
- [ADR-003: Tina/Astro schema sync](docs/architecture/adr/003-tina-astro-schema-sync.md)
- [Tina CMS plan](docs/plans/tina-cms-plan.md) — completed implementation plan
