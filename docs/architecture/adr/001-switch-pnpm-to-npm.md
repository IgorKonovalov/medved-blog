# ADR-001: Switch package manager from pnpm to npm

## Status: accepted

## Context

The project originally chose pnpm for its speed and strict dependency resolution. However, the goal is to keep the build process as close to barebone Node.js as possible. npm ships with Node.js — it requires zero additional tooling, has no install step of its own, and is universally available in every CI/CD environment without extra configuration.

For a small Astro site with few dependencies, pnpm's performance advantages are negligible. The simplicity of using the built-in package manager outweighs the marginal speed gains.

## Decision

Replace pnpm with npm as the project's package manager:

- Remove the `pnpm` config section from `package.json`
- Delete `pnpm-lock.yaml`, generate `package-lock.json`
- Update all documentation and tooling references
- Use `npm run <script>` (or `npm <script>` for built-in commands) everywhere

## Consequences

**Benefits**:
- Zero tooling prerequisites beyond Node.js itself
- Simpler CI/CD — no `pnpm install` step needed in build pipelines
- Cloudflare Pages, GitHub Actions, and any Node.js environment support npm out of the box
- Lower barrier for contributors

**Trade-offs**:
- Slightly slower installs compared to pnpm (irrelevant at this project's scale)
- No strict dependency isolation (phantom dependencies possible, but unlikely with few deps)
- `node_modules` uses more disk space (flat structure vs content-addressable store)
