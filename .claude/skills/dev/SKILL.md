---
name: dev
description: Developer for the medved-blog project (Astro + TypeScript + Cloudflare Pages). Implements features step-by-step from architecture plans produced by the blog-architect skill. Use when (1) an approved implementation plan exists at `docs/plans/` and the user wants it implemented, (2) the user says "dev", "implement", "build this", or "code this", (3) the user wants to implement a specific step from a plan, or (4) the user wants to scaffold the project or add a new component/page/layout.
---

# Dev — Implementation Mode

Implement features for the medved-blog project (BMW auto electrician service site, Astro + TypeScript + Cloudflare Pages) by executing architecture plans step-by-step.

## Context Loading

Do NOT eagerly read plans, scan source code, or start any work on invocation. Instead:

1. List available implementation plans in `docs/plans/` (file names only — do NOT read them)
2. Present the list to the user and **wait for instructions** — the user will tell you which plan and which step(s) to work on
3. Only after the user gives a specific instruction, load the relevant plan and source files

Reference these files from the blog-architect skill **as needed** during implementation (not upfront):
- Coding standards: `.claude/skills/blog-architect/references/coding-standards.md`
- NFR checklist: `.claude/skills/blog-architect/references/nfr-checklist.md`
- Architecture decisions: `docs/architecture/blog-stack-decisions.md`

## Workflow

### 1. Review the Plan

Only after the user tells you what to implement:

1. Read the relevant implementation plan
2. Identify which steps are already completed (check existing code against acceptance criteria)
3. Confirm with the user which step(s) to implement next
4. If the plan has open questions, surface them before proceeding

### 2. Implement Step-by-Step

Execute each plan step in order. For every step:

1. **Read existing files** that will be modified — understand context before changing code
2. **Implement the change** following the plan's instructions and acceptance criteria
3. **Run the build** (`yarn build`) to verify no errors
4. **Verify acceptance criteria** from the plan
5. **Mark the step done** — update the plan's step status if the user confirms

After completing a step, summarize what was done and ask whether to proceed to the next step.

### 3. Handoff

When all plan steps are complete:

1. Run a full build (`yarn build`) to verify the site compiles
2. Summarize what was implemented
3. Note any follow-up tasks from the plan
4. Suggest invoking the **blog-architect** skill to review the implementation against NFRs

## Coding Rules

These are non-negotiable for this project. Consult the full coding standards reference when unsure.

### Astro Components
- Structure: frontmatter fence (`---`) with imports, Props interface, logic; then template; then scoped `<style>`
- Naming: `PascalCase.astro` for components, `kebab-case.astro` for pages
- No `client:*` directives unless the component is genuinely interactive; prefer `client:visible` for below-fold elements
- `<h1>` comes from the layout, content markdown headings start at `##`

### TypeScript
- Strict mode (extends `astro/tsconfigs/strict`), no `any` types
- Use `getCollection()` / `getEntry()` for all content access
- `type` for simple shapes, `interface` for extensible contracts

### CSS
- Mobile-first: base styles for mobile, `@media` queries for larger screens
- Design tokens via CSS custom properties (defined in `src/styles/tokens.css`)
- Scoped `<style>` blocks by default; global CSS only for tokens, reset, typography

### Images
- Use Astro `<Image>` or `<Picture>` components, not raw `<img>`
- Co-locate images with their content in `content/` directories
- Always set `width`, `height`, and `alt` (in Russian)

### Content
- Frontmatter must satisfy the Zod schema for its collection
- Russian transliterated URL slugs (`/uslugi/diagnostika-elektriki/`)
- Co-located images in the same directory as the markdown file

### Cloudflare Workers
- Live in `functions/` directory (path maps to route)
- Secrets via `context.env`, never committed to Git
- Server-side validation, rate limiting, input sanitization

## Guidelines

- **Follow the plan** — implement what was specified, not more. Deviations need user approval.
- **One step at a time** — each step should leave the site in a deployable state. Never leave broken intermediate states.
- **Build often** — run `yarn build` after each meaningful change to catch errors early.
- **Read before write** — always read existing files before modifying them.
- **Minimal changes** — change only what the step requires. Do not refactor surrounding code or add improvements unless the plan calls for it.
- **Ask, don't assume** — if the plan is ambiguous or a decision is needed, ask the user rather than guessing.
