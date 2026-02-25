# CLAUDE.md

## Project Overview

medved-blog is a service website + blog for a BMW auto electrician in Saint Petersburg, Russia. The site targets car owners searching for electrical repair services. Content is in Russian only.

## Tech Stack

- **Astro** (static site generator, zero JS by default)
- **TypeScript** (strict mode, extends `astro/tsconfigs/strict`)
- **pnpm** (package manager)
- **Cloudflare Pages** (hosting + Workers for form backend)
- **Tina CMS** (visual editing, git-based)

## Key Architectural Decisions

- **Zero JS by default** — never add `client:*` directives unless the component genuinely needs client-side interactivity. Static components must stay server-rendered.
- **Content Collections** — all content (blog, services, testimonials) lives in `src/content/` as markdown with Zod-validated frontmatter schemas defined in `src/content.config.ts`.
- **Mobile-first** — CSS starts with mobile styles, media queries add wider layouts. Primary audience is on phones.
- **Russian content** — all user-facing text, meta descriptions, and URL slugs are in Russian (transliterated for URLs). `<html lang="ru">` on every page.

## Commands

```
pnpm dev        # Dev server
pnpm build      # Production build
pnpm preview    # Preview built site
pnpm check      # TypeScript + Astro validation
```

## Project Conventions

- Components: `PascalCase.astro` in `src/components/`
- Layouts: `PascalCase.astro` with `Layout` suffix in `src/layouts/`
- Pages: `kebab-case.astro` or `[slug].astro` in `src/pages/`
- Utilities: `camelCase.ts` in `src/utils/`
- Scoped `<style>` blocks by default; global CSS only for tokens and reset
- Content headings start at `##` (the `<h1>` comes from the page layout)
- Images co-located with their markdown file in the same directory

## Architecture Documentation

- `docs/architecture/blog-stack-decisions.md` — all technology choices with rationale
- `docs/architecture/adr/` — Architecture Decision Records (created as needed)
- `docs/plans/` — implementation plans for features

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

**Format**:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat` — new feature (correlates with MINOR in SemVer)
- `fix` — bug fix (correlates with PATCH in SemVer)
- `docs` — documentation only
- `style` — formatting, missing semicolons, etc. (no code change)
- `refactor` — code change that neither fixes a bug nor adds a feature
- `perf` — performance improvement
- `test` — adding or correcting tests
- `build` — changes to build system or dependencies
- `ci` — CI/CD configuration
- `chore` — other changes that don't modify src or test files

**Scopes** (optional, use when relevant):
- `content` — content collections, markdown files
- `layout` — layouts, header, footer
- `pages` — page routes
- `styles` — CSS, tokens, design system
- `worker` — Cloudflare Workers / form backend
- `cms` — Tina CMS configuration

**Rules**:
- Description in lowercase, imperative mood ("add feature" not "added feature")
- No period at the end of the description
- Body wraps at 72 characters
- Breaking changes: add `!` after type/scope (e.g., `feat!: ...`) and a `BREAKING CHANGE:` footer

**Examples**:
```
feat(pages): add service detail dynamic route
fix(worker): validate phone number format in callback form
docs: update architecture decision for CMS choice
build: add astro sitemap integration
feat(content): define blog collection schema
```

## Environment Variables

See `.env.example` for required variables. Secrets (Telegram bot token, etc.) are stored in Cloudflare Pages dashboard, never committed.
