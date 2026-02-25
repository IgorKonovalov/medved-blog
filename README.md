# medved-blog

Service website and blog for a BMW auto electrician based in Saint Petersburg. Built with Astro, hosted on Cloudflare Pages.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro](https://astro.build/) (static output, zero JS by default) |
| Language | TypeScript (strict) |
| Content | Markdown + Astro Content Collections (Zod schemas) |
| CMS | Tina CMS (visual editing for non-technical writers) |
| Hosting | Cloudflare Pages |
| Forms | Cloudflare Workers → Telegram Bot |
| Package Manager | npm (built into Node.js) |

## Getting Started

```bash
npm install
npm run dev        # Start dev server at http://localhost:4321
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run check      # TypeScript and Astro validation
```

## Project Structure

```
src/
  components/     # Reusable Astro components
  layouts/        # Page layouts (BaseLayout, BlogPostLayout, etc.)
  pages/          # File-based routing
  styles/         # Global CSS (tokens, reset, typography)
  content/        # Content Collections (blog, services, testimonials)
functions/        # Cloudflare Pages Functions (Workers)
public/           # Static assets (fonts, images, favicons)
docs/
  architecture/   # Stack decisions and ADRs
  plans/          # Implementation plans
```

## Content Collections

- **services** — Service pages (electrical diagnostics, wiring repair, etc.)
- **blog** — SEO articles and guides
- **testimonials** — Customer reviews

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

## Documentation

- [Stack Decisions](docs/architecture/blog-stack-decisions.md) — architecture decisions with rationale
- [Scaffolding Plan](docs/plans/project-scaffolding-plan.md) — phased implementation plan
