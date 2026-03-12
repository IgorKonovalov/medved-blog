# ADR-003: Tina CMS and Astro Content Collection Schemas Are Maintained Separately

> Date: 2026-03-12
> Status: Accepted

## Context

Tina CMS requires its own schema definition in `tina/config.ts` that describes the fields for each content collection. Astro Content Collections require a separate Zod schema in `src/content.config.ts` for build-time type validation.

These two schemas describe the same data (blog, services, testimonials frontmatter) but serve different systems and cannot be auto-generated from each other without additional tooling.

## Decision

Maintain both schemas separately in the same repository. Neither schema auto-generates the other.

- `tina/config.ts` — Tina field definitions (drives the editing UI)
- `src/content.config.ts` — Zod schemas (drives TypeScript types and build-time validation)

Both files include a comment pointing to the other.

## Consequences

**Risk**: The schemas can drift apart. If a field is added in Tina but not in the Zod schema, Tina saves valid content that then fails the Astro build. The reverse (Zod field added without Tina) means the field is invisible in the editor.

**Mitigation**:
- Both files live in the same repo and are reviewed in the same PRs
- The Astro build (`yarn build:cms:prod`) runs after Tina build — a schema mismatch causes a build failure on Cloudflare Pages, preventing a broken deploy

**Alternative rejected**: Using `@tinacms/astro` integration to make Tina the single source of truth. This couples the site too tightly to Tina and violates the "CMS is swappable" principle from the architecture decisions.
