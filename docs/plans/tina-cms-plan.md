# Implementation Plan: Tina CMS Integration

> Created: 2026-02-28
> Status: in-progress
> Architect pre-flight: 2026-03-11

## Overview

Integrate Tina CMS for visual, git-based content editing. Content writers will edit blog posts, services, and testimonials through Tina's visual interface at `/admin/` — changes commit directly to the Git repo. No external database, no content migration — Tina layers on top of existing markdown files.

## Architect Pre-flight Notes (2026-03-11)

- **Astro 5 loader API confirmed**: `src/content.config.ts` uses `loader: glob(...)` (Astro 5 content layer), not the legacy collections. Tina is unaffected — it writes markdown files regardless. Do NOT run `npx @tinacms/cli init`; it generates old-style Astro config. Manual install only.
- **`.gitignore` missing `tina/__generated__/`** — Step 1.4 must add this.
- **Schema parity**: Tina config field names must match the Zod schema in `content.config.ts`. Current field names verified: `title`, `date`, `updated`, `description`, `tags`, `draft`, `image`, `imageAlt` for blog; `title`, `description`, `order`, `image`, `imageAlt`, `draft` for services; `author`, `car`, `date`, `rating` for testimonials.
- **`image()` path format**: Seed content uses `image: ./hero.jpg` (relative path). Tina's `image` field type must be configured to write the same format. Phase 3 open question is real — test this early.

## Current State

- Three content collections defined in `src/content.config.ts`: blog, services, testimonials
- Existing seed content in `src/content/` as markdown with Zod-validated frontmatter
- Schemas use Astro's `image()` helper for co-located images
- No CMS installed — content is edited via text editor and git commits
- Architecture decision in `blog-stack-decisions.md` locks in Tina CMS

## Architecture Context

From `blog-stack-decisions.md`:
- **Why Tina**: Visual on-page editing, git-based (markdown stays in repo), free for up to 2 users
- **Trade-offs**: 2-user free tier limit, editing UI is in English, less mature for complex structured content
- **Migration path**: Content is standard markdown — switching CMS later requires no content migration

## Phases

| Phase | What it delivers | Complexity |
|---|---|---|
| 1 | Tina installed + schema for blog collection (local mode) | M |
| 2 | Services and testimonials collection schemas | S |
| 3 | Media management (co-located images) | M |
| 4 | Tina Cloud setup (production editing) | S |
| 5 | Build integration + Cloudflare Pages update | S |

---

## Phase 1: Tina Installation + Blog Collection

> **Goal**: Tina CMS installed and running locally. Blog posts editable via visual editor at `http://localhost:4321/admin/`. Changes save as markdown files to the repo.

### New files to create

| File | Purpose |
|---|---|
| `tina/config.ts` | Tina CMS configuration — collections, media, build settings |
| `tina/__generated__/` | Auto-generated types and GraphQL schema (gitignored) |

### Existing files to modify

| File | Change description |
|---|---|
| `package.json` | Add `tinacms` dependency and Tina dev/build scripts |
| `.gitignore` | Add `tina/__generated__/` |
| `astro.config.mjs` | No changes needed — Tina runs as a separate dev process alongside Astro |

### Step 1.1: Install Tina CMS

- **Complexity**: S
- **Files**: `package.json`
- **What**:
  1. Run `npx @tinacms/cli@latest init` — this scaffolds `tina/config.ts` with a starter config
  2. Or manual install: `yarn add tinacms` and create `tina/config.ts` by hand
  3. **Recommended**: Manual install for full control over the config file (the CLI scaffolder makes assumptions that may not match our project)
- **Acceptance**: `tinacms` is in `package.json` dependencies.

### Step 1.2: Configure Tina for the blog collection

- **Complexity**: M
- **Files**: `tina/config.ts`
- **What**: Create Tina config that maps to the existing blog content collection. The Tina schema must match the Zod schema in `content.config.ts` — same field names, same types, same constraints.

  ```typescript
  import { defineConfig } from 'tinacms';

  export default defineConfig({
    branch: process.env.TINA_BRANCH || 'master',
    clientId: process.env.TINA_CLIENT_ID || '',
    token: process.env.TINA_TOKEN || '',

    build: {
      outputFolder: 'admin',
      publicFolder: 'public',
    },

    media: {
      tina: {
        mediaRoot: 'src/content',
        publicFolder: '',
      },
    },

    schema: {
      collections: [
        {
          name: 'blog',
          label: 'Блог',
          path: 'src/content/blog',
          match: {
            include: '*/index',
          },
          format: 'md',
          fields: [
            { type: 'string', name: 'title', label: 'Заголовок', required: true },
            { type: 'datetime', name: 'date', label: 'Дата публикации', required: true },
            { type: 'datetime', name: 'updated', label: 'Дата обновления' },
            {
              type: 'string',
              name: 'description',
              label: 'Описание (SEO)',
              required: true,
              ui: { validate: (val) => val && val.length > 160 ? 'Максимум 160 символов' : undefined },
            },
            {
              type: 'string',
              name: 'tags',
              label: 'Теги',
              list: true,
            },
            { type: 'boolean', name: 'draft', label: 'Черновик' },
            { type: 'image', name: 'image', label: 'Изображение' },
            { type: 'string', name: 'imageAlt', label: 'Alt-текст изображения' },
            {
              type: 'rich-text',
              name: 'body',
              label: 'Содержание',
              isBody: true,
            },
          ],
        },
      ],
    },
  });
  ```

- **Key mapping decisions**:
  - `path: 'src/content/blog'` — points to our content directory
  - `match.include: '*/index'` — matches the `{slug}/index.md` directory structure
  - `format: 'md'` — plain markdown (not MDX)
  - `isBody: true` on `body` field — maps to the markdown body below frontmatter
  - Tags as `string` list — matches Zod `z.array(z.string())`
  - Image as `image` type — Tina handles image uploads and references

- **Schema parity concern**: Tina's schema and Astro's Zod schema must stay in sync. When a field is added/changed in one, it must be updated in the other. This is a known Tina trade-off — no auto-sync between the two.

- **Acceptance**: `yarn dev:cms` starts both Tina (port 4001) and Astro (port 4321). Visiting `http://localhost:4001` shows the Tina editor with the blog collection. Note: `/admin/` at port 4321 only exists in production (after `yarn build:cms`).

### Step 1.3: Add development scripts ✅

- **Complexity**: S
- **Files**: `package.json`
- **Actual scripts** (diverged from plan due to Node 25 + Windows constraints):
  ```json
  {
    "scripts": {
      "dev": "astro dev",
      "dev:cms": "tinacms build --local --skip-cloud-checks --skip-search-index && tinacms dev -c \"astro dev\"",
      "build": "astro build",
      "build:cms": "tinacms build --local --skip-cloud-checks --skip-search-index && astro build",
      "build:cms:prod": "tinacms build --skip-search-index && astro build",
      "preview": "astro preview",
      "check": "astro check"
    }
  }
  ```
  - `dev:cms` **pre-builds the admin** to `public/admin/` before starting the dev server — this is required so that `localhost:4321/admin/` serves the correct entry point
  - `tinacms dev` always runs in local mode — no extra flags needed; no cloud credentials required
  - `tinacms build --local` — local mode for `build:cms`; `--skip-cloud-checks` skips client ID validation; `--skip-search-index` avoids `better-sqlite3` (not built on Node 25/Windows without VS Build Tools)
  - `build:cms:prod` — production build for Phase 5 (Cloudflare Pages, requires `TINA_CLIENT_ID` + `TINA_TOKEN`)
- **Note**: `@tinacms/cli@2.1.9` installed as a separate package (the `tinacms` npm package does not ship the CLI binary)
- **Also added**: `react@^18`, `react-dom@^18`, `react-dnd@^16`, `react-dnd-html5-backend@^16` to `devDependencies` — peer deps required by Tina's rich-text editor bundler
- **Acceptance**: ✅ `yarn build:cms` produces `dist/admin/index.html` and all 12 site pages

### Step 1.4: Update .gitignore ✅

- **Complexity**: S
- **Files**: `.gitignore`
- **What**: Added:
  ```
  # Tina CMS
  tina/__generated__/
  public/admin/
  ```
  Both `tina/__generated__/` and `public/admin/` are build artifacts regenerated by `tinacms build`/`dev`.
- **Acceptance**: ✅ Generated files won't appear in `git status`.

### Manual Testing — Phase 1

```
1. yarn dev:cms  (builds admin to public/admin/, then starts Tina:4001 + Astro:4321)
2. Open http://localhost:4321/admin/  ← USE ASTRO'S PORT, not 4001
   (Images in the editor resolve against localhost:4321 where Astro serves public/)
3. Verify: Tina sidebar shows "Блог" collection
4. Click the seed blog post → visual editor opens
5. Edit the title → save → check that src/content/blog/primer-stati/index.md is updated
6. Verify the change appears in git diff
7. Create a new blog post via Tina → verify file created in src/content/blog/{slug}/index.md
8. yarn build:cms → verify dist/ includes admin/ directory
9. yarn check — no TypeScript errors
```

> **Why localhost:4321/admin/ not localhost:4001?**
> Tina's Vite dev server (port 4001) has its root in `node_modules/@tinacms/app/` and does NOT serve the project's `public/` folder. Images referenced in content (stored at `public/images/`) return 404 from port 4001. The `dev:cms` pre-build step generates `public/admin/index.html` which loads the Tina React app from port 4001 but keeps the document origin at port 4321 — so all image URLs resolve correctly via Astro's static file server. The Tina GraphQL API is called via absolute URL `http://localhost:4001/graphql` and works regardless of origin.

---

## Phase 2: Services & Testimonials Collections

> **Goal**: All three content types are editable via Tina.

### Existing files to modify

| File | Change description |
|---|---|
| `tina/config.ts` | Add services and testimonials collection definitions |

### Step 2.1: Add services collection to Tina

- **Complexity**: S
- **Files**: `tina/config.ts`
- **What**: Add a services collection:
  ```typescript
  {
    name: 'services',
    label: 'Услуги',
    path: 'src/content/services',
    match: { include: '*/index' },
    format: 'md',
    fields: [
      { type: 'string', name: 'title', label: 'Название услуги', required: true },
      {
        type: 'string',
        name: 'description',
        label: 'Описание (SEO)',
        required: true,
        ui: { validate: (val) => val && val.length > 160 ? 'Максимум 160 символов' : undefined },
      },
      { type: 'number', name: 'order', label: 'Порядок сортировки' },
      { type: 'image', name: 'image', label: 'Изображение' },
      { type: 'string', name: 'imageAlt', label: 'Alt-текст изображения' },
      { type: 'boolean', name: 'draft', label: 'Черновик' },
      { type: 'rich-text', name: 'body', label: 'Содержание', isBody: true },
    ],
  }
  ```
- **Acceptance**: Services appear in Tina sidebar. Editing a service updates the markdown file.

### Step 2.2: Add testimonials collection to Tina

- **Complexity**: S
- **Files**: `tina/config.ts`
- **What**: Add a testimonials collection:
  ```typescript
  {
    name: 'testimonials',
    label: 'Отзывы',
    path: 'src/content/testimonials',
    format: 'md',
    fields: [
      { type: 'string', name: 'author', label: 'Автор', required: true },
      { type: 'string', name: 'car', label: 'Автомобиль', required: true },
      { type: 'datetime', name: 'date', label: 'Дата', required: true },
      {
        type: 'number',
        name: 'rating',
        label: 'Оценка (1-5)',
        ui: { validate: (val) => (val < 1 || val > 5) ? 'Оценка от 1 до 5' : undefined },
      },
      { type: 'rich-text', name: 'body', label: 'Текст отзыва', isBody: true },
    ],
  }
  ```
  - **Note**: Testimonials use flat files (`*.md`) not directory-based — no `match.include` needed.
- **Acceptance**: All three collections visible in Tina. Each can be created, edited, saved.

### Manual Testing — Phase 2

```
1. yarn dev:cms
2. Tina sidebar shows: Блог, Услуги, Отзывы
3. Edit the seed service → save → verify markdown updated
4. Edit the seed testimonial → save → verify markdown updated
5. Create a new testimonial via Tina → verify file created
6. yarn build:cms — clean build
```

---

## Phase 3: Media Management ✅

> **Goal**: Content writers can upload and manage images through Tina's media manager.

### Implementation (Option 2 — public/images/) ✅

Option 1 (co-located images in `src/content/`) was not viable with Tina's media manager:
- Tina's Vite dev server root is `node_modules/@tinacms/app/`, not the project root
- Images in `src/content/` cannot be served by Tina's dev server
- Astro's `image()` schema helper does not work with images stored outside `src/`

**Implemented Option 2** — images in `public/images/` with absolute paths:

| File | Change |
|---|---|
| `tina/config.ts` | `media.tina: { publicFolder: 'public', mediaRoot: 'images' }` |
| `src/content.config.ts` | `image()` → `z.string().optional()` for blog and services |
| `src/layouts/BlogPostLayout.astro` | `ImageMetadata` → `string`, `<Image>` → `<img>` |
| `src/components/BlogPostCard.astro` | Same |
| `src/layouts/ServiceLayout.astro` | Same |
| `src/components/ServiceCard.astro` | Same |
| `src/content/blog/primer-stati/index.md` | `image: /images/blog/primer-stati/hero.jpg` |
| `src/content/services/diagnostika-elektriki/index.md` | `image: /images/services/diagnostika-elektriki/hero.jpg` |
| `public/images/blog/primer-stati/hero.jpg` | Moved from `src/content/` |
| `public/images/services/diagnostika-elektriki/hero.jpg` | Moved from `src/content/` |

**Trade-off**: Images in `public/` are not processed by Astro's image optimization pipeline (no webp conversion, no srcset). For this site's current scale this is acceptable — can be revisited if performance becomes a concern.

**Image upload workflow**: Tina media manager stores uploads to `public/images/`. The `image` field in frontmatter gets an absolute path like `/images/blog/my-post/hero.jpg`.

### Manual Testing — Phase 3

```
1. yarn dev:cms
2. Open http://localhost:4321/admin/
3. Edit seed blog post → click image field → Tina media manager opens
4. Verify: existing images at public/images/ are visible with thumbnails
5. Upload a new image → verify saved to public/images/
6. Select the image → save post → verify frontmatter updated with /images/... path
7. yarn build:cms — clean build, no errors
8. yarn preview → image displays on the blog post page
```

---

## Phase 4: Tina Cloud (Production Editing)

> **Goal**: Content writers can edit the site in production via Tina Cloud at `https://bmw-electric-spb.ru/admin/`. Edits create commits on the repo.

### Existing files to modify

| File | Change description |
|---|---|
| `tina/config.ts` | Add Tina Cloud client ID and token references |
| `.env.example` | Document Tina Cloud environment variables |

### Step 4.1: Create Tina Cloud project

- **Complexity**: S
- **What**: At https://app.tina.io:
  1. Sign up / sign in
  2. Create a new project connected to the `medved-blog` GitHub repository
  3. Select the `master` branch
  4. Tina Cloud generates:
     - **Client ID** — identifies the project
     - **Read-only Token** — used in production builds to query content
  5. Note: Tina Cloud free tier allows 2 users
- **Acceptance**: Project created in Tina Cloud dashboard.

### Step 4.2: Configure environment variables

- **Complexity**: S
- **Files**: `.env.example`, Cloudflare Pages dashboard
- **What**:
  1. Add to `.env.example`:
     ```
     # Tina CMS (Tina Cloud — for production editing)
     TINA_CLIENT_ID=
     TINA_TOKEN=
     ```
  2. Add these variables in Cloudflare Pages dashboard:
     - `TINA_CLIENT_ID` = the client ID from Tina Cloud
     - `TINA_TOKEN` = the read-only token
  3. The `tina/config.ts` already references these via `process.env.TINA_CLIENT_ID` and `process.env.TINA_TOKEN`
- **Acceptance**: Environment variables set in both `.env.example` and Cloudflare.

### Step 4.3: Update Cloudflare Pages build command

- **Complexity**: S
- **What**: In Cloudflare Pages project settings, update the build command:
  - **From**: `yarn build`
  - **To**: `yarn build:cms`
  This ensures `tinacms build` runs before `astro build`, generating the admin UI in `dist/admin/`.
- **Acceptance**: Cloudflare Pages build includes the Tina admin at `/admin/`.

### Step 4.4: Test production editing flow

- **Complexity**: S
- **What**:
  1. Deploy to Cloudflare Pages with the updated build
  2. Visit `https://bmw-electric-spb.ru/admin/`
  3. Tina Cloud auth flow — login with GitHub
  4. Edit a blog post → save
  5. Verify: Tina creates a commit on the repo
  6. Verify: Cloudflare Pages auto-deploys the change
  7. Visit the edited page — changes visible
- **Acceptance**: Full editing round-trip works in production.

### Manual Testing — Phase 4

```
1. Deploy with build:cms command
2. Visit /admin/ on production
3. Authenticate via Tina Cloud
4. Edit a post → save → verify commit in GitHub
5. Wait for Cloudflare Pages redeploy
6. Verify changes live on the site
7. Verify non-admin pages still work normally (no regressions)
```

---

## Phase 5: Build Integration & Cleanup

> **Goal**: Ensure the Tina + Astro build pipeline is robust. Update documentation.

### Existing files to modify

| File | Change description |
|---|---|
| `docs/architecture/blog-stack-decisions.md` | Update CMS section with implementation details |
| `CLAUDE.md` | Add Tina CMS commands and conventions |

### Step 5.1: Verify build pipeline

- **Complexity**: S
- **What**: Confirm the full build chain works:
  1. `yarn build:cms` — Tina generates admin UI, then Astro builds the site
  2. `dist/admin/index.html` exists (Tina admin SPA)
  3. All other routes in `dist/` are unchanged
  4. `yarn check` — TypeScript passes
  5. `yarn build` (without CMS) still works for quick builds
- **Acceptance**: Both build paths work without errors.

### Step 5.2: Update project documentation

- **Complexity**: S
- **Files**: `CLAUDE.md`, `docs/architecture/blog-stack-decisions.md`
- **What**:
  1. Add to CLAUDE.md Commands section:
     ```
     yarn dev:cms    # Dev server with Tina CMS editor
     yarn build:cms  # Production build with Tina admin
     ```
  2. Add to CLAUDE.md Conventions:
     - `tina/config.ts` must stay in sync with `src/content.config.ts`
     - Tina's `__generated__/` is gitignored
  3. Update `blog-stack-decisions.md` CMS section with actual implementation notes
- **Acceptance**: Documentation reflects reality.

### Step 5.3: ADR for schema dual-maintenance

- **Complexity**: S
- **Files**: `docs/architecture/adr/003-tina-astro-schema-sync.md`
- **What**: Document the decision that Tina schema and Astro Content Collection schema are maintained separately (no auto-sync). This is a known trade-off:
  - **Risk**: Schemas drift apart → content saves in Tina but fails Astro build
  - **Mitigation**: Both schemas live in the same repo, reviewed in same PRs. Add a comment in each file pointing to the other.
  - **Alternative rejected**: Using Tina as the single source of truth (via `@tinacms/astro`) — this couples the site too tightly to Tina and breaks the "CMS is swappable" principle.
- **Acceptance**: ADR created and linked from `blog-stack-decisions.md`.

---

## NFR Considerations

### Performance
- **Tina admin is client-side only** — the `/admin/` route loads a React SPA. This does NOT affect any other page. All public-facing pages remain zero JS.
- **Build time**: Adds `tinacms build` step (~5-10 seconds) before Astro build. Total build time stays under 60 seconds.
- **No runtime dependency**: Tina Cloud is queried at build time only. If Tina Cloud is down, the site still works — it's already deployed as static HTML.

### SEO
- **No impact**: `/admin/` is not indexed (add `Disallow: /admin/` to `robots.txt` in Phase 1 of deployment plan).
- **All public pages unchanged** — Tina adds no markup to visitor-facing pages.

### Accessibility
- **Not applicable** to Tina admin (third-party UI, English). Public-facing site is unaffected.

### Mobile
- **Tina admin**: Designed for desktop editing. Content writers should use a desktop or tablet.
- **Public site**: Unaffected.

### Security
- **Tina Cloud auth**: Writers authenticate via GitHub OAuth — no new credentials to manage.
- **Tokens**: `TINA_CLIENT_ID` and `TINA_TOKEN` are build-time only, stored as Cloudflare Pages env vars, never exposed to the client.
- **Admin access**: Only authenticated Tina Cloud users with repo access can edit. No public write access.

---

## Open Questions

- [ ] **Tina + Astro `image()` compatibility**: Will Tina's image upload generate paths that Astro's `image()` schema helper can resolve? This needs testing in Phase 3. Fallback plan documented.
- [ ] **Tina Cloud free tier**: 2 users — is this sufficient? Who needs access? (Owner + one content writer?)
- [ ] **Branch workflow**: Should Tina edits go directly to `master`, or should writers edit on a `content` branch with PR review? (Recommend: direct to `master` for simplicity — the site auto-deploys and content errors are low-risk.)

---

## Follow-up Tasks (Out of Scope)

- [ ] Add `Disallow: /admin/` to `robots.txt` (do in deployment plan)
- [ ] Custom Tina field components (e.g., tag autocomplete from existing tags)
- [ ] Tina templates (pre-filled frontmatter for new blog posts)
- [ ] Content scheduling (draft → publish on date)
- [ ] Multi-branch editing workflow (if more than 2 editors needed)
