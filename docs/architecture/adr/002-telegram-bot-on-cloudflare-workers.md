# ADR-002: Host interactive Telegram bot on Cloudflare Workers

## Status: accepted

## Context

The site needs an interactive Telegram bot that allows users to request callbacks, browse services, and get contact info directly via Telegram. This is a separate concern from the website callback form (which POSTs to a Cloudflare Pages Function and sends a one-way notification).

The bot needs hosting. Three options were evaluated:

1. **Cloudflare Workers (webhook mode)** — Telegram POSTs updates to a Worker URL; stateless, serverless, free tier (100K req/day)
2. **Railway / Render (long-polling Node.js)** — persistent process polls Telegram; $5/mo or free tier with cold starts
3. **VPS (Hetzner / Timeweb)** — full server; ~3-5 EUR/mo; maximum operational overhead

## Decision

Host the Telegram bot on **Cloudflare Workers** using webhook mode with the **grammY** framework.

### Key choices

| Aspect | Choice | Rationale |
|---|---|---|
| **Hosting** | Cloudflare Workers | Already in the stack, free tier is sufficient, no new vendor |
| **Bot mode** | Webhook (not long polling) | Stateless, fits serverless model, Telegram pushes updates |
| **Framework** | grammY | First-class Cloudflare Workers support via webhook adapter; lightweight, well-typed |
| **State storage** | Cloudflare KV | Free 100K reads/day; stores conversation state (which step in a flow the user is on) |
| **Monorepo layout** | `packages/bot/` with npm workspaces | Clean separation from Astro site; independent deploy via `wrangler deploy` |
| **Deployment** | `wrangler deploy` (separate from site) | Bot is an independent Worker, not a Pages Function; deployed independently |

### Monorepo structure

```
medved-blog/
├── src/                    # Astro site (unchanged)
├── functions/              # Cloudflare Pages Functions (callback form)
├── packages/
│   └── bot/
│       ├── src/
│       │   ├── index.ts    # Worker entry point + webhook handler
│       │   ├── bot.ts      # grammY bot definition, commands, menus
│       │   ├── handlers/   # Command and conversation handlers
│       │   └── types.ts    # Shared types (Env bindings, state)
│       ├── wrangler.toml   # Worker config + KV bindings
│       ├── package.json    # Bot-specific dependencies
│       └── tsconfig.json
├── package.json            # Root — npm workspaces: ["packages/*"]
└── astro.config.mjs
```

### Separation from callback form

- **Website callback form** → Cloudflare Pages Function at `functions/api/callback.ts` (deployed with site)
- **Interactive Telegram bot** → Cloudflare Worker at `packages/bot/` (deployed separately)

These are separate services with different concerns. The form handler receives HTTP POSTs from the website and pushes a notification. The bot handles bidirectional Telegram conversations. They both send messages to the same Telegram chat/group but through different paths.

## Consequences

**Benefits**:
- Zero additional hosting cost — Cloudflare Workers free tier (100K requests/day) is far beyond what a small-business bot needs
- No new vendor — stays entirely on Cloudflare alongside the site
- No persistent process to monitor — webhook mode means Telegram initiates every interaction
- grammY provides typed API, middleware support, and conversation plugin for multi-step flows
- npm workspaces keep the monorepo clean with independent dependency management
- Independent deploys — bot changes don't trigger a site rebuild and vice versa

**Trade-offs**:
- Workers have 10ms CPU time on free tier (50ms on paid) — sufficient for menu-driven bots, but limits heavy computation
- Stateless — conversation state must be persisted to KV between each message (adds complexity vs in-memory state)
- Webhook mode requires a publicly accessible URL — need to register it with Telegram via `setWebhook`
- grammY's conversation plugin needs adapter for Cloudflare Workers (documented in grammY docs)
- Local development requires `wrangler dev` + a tunnel (e.g., `cloudflared tunnel`) or Telegram test bot with polling mode for dev
