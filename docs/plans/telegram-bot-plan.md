# Implementation Plan: Interactive Telegram Bot

> Source: `docs/features/telegram-bot.md`
> Created: 2026-02-25
> Status: draft

## Overview

An interactive Telegram bot hosted on Cloudflare Workers (webhook mode) that lets users request callbacks, browse services, get contact info, and send free-form messages to the business owner. Uses grammY framework with session state backed by Cloudflare KV.

## Architectural Context

- **ADR**: `docs/architecture/adr/002-telegram-bot-on-cloudflare-workers.md`
- **Hosting**: Cloudflare Workers (webhook mode, free tier)
- **Framework**: grammY with `webhookCallback(bot, "cloudflare-mod")`
- **State**: Cloudflare KV via `@grammyjs/storage-cloudflare`
- **Monorepo**: yarn workspaces, bot lives in `packages/bot/`

## Affected Files

### Existing files to modify

| File | Change description |
|---|---|
| `package.json` | Add `"workspaces": ["packages/*"]` for yarn workspaces |

### New files to create

| File | Purpose |
|---|---|
| `packages/bot/package.json` | Bot package with grammY dependencies |
| `packages/bot/tsconfig.json` | TypeScript config for the bot |
| `packages/bot/wrangler.toml` | Cloudflare Worker config + KV bindings |
| `packages/bot/.dev.vars.example` | Template for local dev secrets |
| `packages/bot/src/index.ts` | Worker entry point — webhook handler |
| `packages/bot/src/bot.ts` | Bot definition — middleware, session, commands |
| `packages/bot/src/handlers/start.ts` | `/start` command + main menu |
| `packages/bot/src/handlers/callback-request.ts` | Callback request flow (name → phone → confirm) |
| `packages/bot/src/handlers/services.ts` | Services list handler |
| `packages/bot/src/handlers/contacts.ts` | Contact info handler |
| `packages/bot/src/handlers/fallback.ts` | Free-form message forwarding |
| `packages/bot/src/keyboards.ts` | Inline keyboard definitions (menus) |
| `packages/bot/src/types.ts` | Env bindings, session data, custom context |
| `packages/bot/src/config.ts` | Business data (services list, contact info, messages) |

## Data Model

### Session state (Cloudflare KV)

No Content Collection changes — the bot is a separate service. State is managed via grammY sessions in KV.

```typescript
// Session stored per-user in KV
type SessionData = {
  /** Current step in callback request flow */
  step: "idle" | "awaiting_name" | "awaiting_phone";
  /** Collected name during callback flow */
  name?: string;
};
```

A simple state machine approach — no need for the grammY conversations plugin. The callback flow only has 2 steps (name, phone), which a session-based state machine handles cleanly without the complexity of the conversations replay engine.

### Environment bindings

```typescript
interface Env {
  BOT_TOKEN: string;          // Secret — Telegram bot token
  BOT_INFO: string;           // Plain var — JSON from getMe (cached)
  OWNER_CHAT_ID: string;      // Plain var — Telegram chat ID for notifications
  WEBHOOK_SECRET: string;     // Secret — verifies Telegram webhook calls
  BOT_SESSIONS: KVNamespace;  // KV binding for session storage
}
```

## Component Breakdown

| Component | Type | Purpose | Notes |
|---|---|---|---|
| Worker entry (`index.ts`) | Cloudflare Worker | Receives webhook POST, routes to bot | Instantiates Bot per request (cheap, no polling) |
| Bot setup (`bot.ts`) | grammY Bot | Assembles middleware chain, session, handlers | Exported as factory function taking `Env` |
| Start handler | grammY command handler | Welcome message + main menu | Inline keyboard with 3 buttons |
| Callback request handler | Session-based state machine | Collects name → phone → forwards to owner | 2-step flow using session state |
| Services handler | Callback query handler | Lists services with website links | Hardcoded initially; dynamic from content collections later |
| Contacts handler | Callback query handler | Sends address, phone, hours | Static data from config |
| Fallback handler | Message handler | Forwards unrecognized text to owner | Catch-all for free-form messages |
| Keyboards | Inline keyboards | Menu buttons | Reusable keyboard definitions |

## Implementation Steps

### Step 1: Set up monorepo with yarn workspaces

- **Complexity**: S
- **Files**: `package.json`, `packages/bot/package.json`, `packages/bot/tsconfig.json`
- **What**:
  1. Add `"workspaces": ["packages/*"]` to root `package.json`
  2. Create `packages/bot/package.json` with dependencies:
     - `grammy`
     - `@grammyjs/storage-cloudflare`
  3. Create `packages/bot/tsconfig.json` extending base TypeScript strict config
  4. Run `yarn install` from root to set up workspace symlinks
- **Acceptance**: `yarn list grammy` shows the package installed in `packages/bot`. Root `node_modules` contains hoisted deps.

### Step 2: Configure Cloudflare Worker

- **Complexity**: S
- **Files**: `packages/bot/wrangler.toml`, `packages/bot/.dev.vars.example`
- **What**:
  1. Create `wrangler.toml` with:
     - Worker name: `medved-bot`
     - `main = "src/index.ts"`
     - `compatibility_date` set to current
     - `[vars]` section for `BOT_INFO` and `OWNER_CHAT_ID`
     - `[[kv_namespaces]]` binding for `BOT_SESSIONS`
  2. Create `.dev.vars.example` documenting required secrets (`BOT_TOKEN`, `WEBHOOK_SECRET`)
  3. Add `.dev.vars` to `.gitignore`
- **Acceptance**: `npx wrangler dev` starts without config errors (will fail on missing KV until Step 7, but config parses).

### Step 3: Create bot types and config

- **Complexity**: S
- **Files**: `packages/bot/src/types.ts`, `packages/bot/src/config.ts`
- **What**:
  1. Define `Env` interface with all Worker bindings
  2. Define `SessionData` type (step + name)
  3. Define custom `BotContext` type extending grammY Context with session
  4. Create `config.ts` with hardcoded business data:
     - Services list (title, short description, URL)
     - Contact info (address, phone, hours)
     - Bot messages in Russian (welcome text, prompts, confirmations)
- **Acceptance**: Types compile without errors.

### Step 4: Create Worker entry point and bot factory

- **Complexity**: M
- **Files**: `packages/bot/src/index.ts`, `packages/bot/src/bot.ts`
- **What**:
  1. `bot.ts`: Export a `createBot(env: Env)` function that:
     - Creates a `Bot<BotContext>` with token and pre-fetched `botInfo`
     - Attaches session middleware using `@grammyjs/storage-cloudflare` with the KV namespace
     - Registers all handlers (imported from `handlers/`)
     - Returns the bot instance
  2. `index.ts`: Worker `fetch` handler that:
     - Calls `createBot(env)` to get a configured bot
     - Returns `webhookCallback(bot, "cloudflare-mod", { secretToken: env.WEBHOOK_SECRET })`
- **Acceptance**: Worker starts with `wrangler dev`. Sending a test POST (without Telegram) returns a response (even if error — proves the handler runs).

### Step 5: Implement `/start` command and main menu

- **Complexity**: S
- **Files**: `packages/bot/src/handlers/start.ts`, `packages/bot/src/keyboards.ts`
- **What**:
  1. Define main menu inline keyboard with buttons:
     - "Заказать звонок" (callback_data: `"cb_request"`)
     - "Наши услуги" (callback_data: `"services"`)
     - "Контакты" (callback_data: `"contacts"`)
  2. `/start` handler: reset session to idle, reply with welcome message + main menu keyboard
- **Acceptance**: Sending `/start` to the bot shows welcome message with 3 buttons.

### Step 6: Implement callback request flow

- **Complexity**: M
- **Files**: `packages/bot/src/handlers/callback-request.ts`
- **What**:
  1. On `cb_request` callback query: set session step to `"awaiting_name"`, ask for name
  2. On text message when step is `"awaiting_name"`: save name, set step to `"awaiting_phone"`, ask for phone (offer share contact button)
  3. On text/contact message when step is `"awaiting_phone"`: extract phone, forward to owner chat (name + phone + Telegram username + link to user), reset session to idle, confirm to user, show main menu again
  4. Rate limit: check last request timestamp in session, reject if too frequent
- **Acceptance**: Full flow works: tap "Заказать звонок" → enter name → enter phone → owner receives notification → user sees confirmation.

### Step 7: Implement services and contacts handlers

- **Complexity**: S
- **Files**: `packages/bot/src/handlers/services.ts`, `packages/bot/src/handlers/contacts.ts`
- **What**:
  1. Services handler (on `services` callback query): send a message listing services from `config.ts` with inline URL buttons linking to the website
  2. Contacts handler (on `contacts` callback query): send formatted message with address, phone (clickable), working hours, and a "Открыть на карте" (open on map) URL button
  3. Both handlers append a "← Главное меню" button to return to start
- **Acceptance**: Tapping "Наши услуги" shows service list with links. Tapping "Контакты" shows contact card.

### Step 8: Implement fallback message forwarding

- **Complexity**: S
- **Files**: `packages/bot/src/handlers/fallback.ts`
- **What**:
  1. Catch-all handler for text messages when session step is `"idle"`
  2. Forward the message to the owner chat with context (who sent it, Telegram link)
  3. Reply to user confirming the message was sent
- **Acceptance**: Sending a random text message to the bot forwards it to the owner and confirms to the user.

### Step 9: Create KV namespace and deploy

- **Complexity**: S
- **Files**: `packages/bot/wrangler.toml` (update KV ID)
- **What**:
  1. Create KV namespace: `npx wrangler kv namespace create BOT_SESSIONS`
  2. Update `wrangler.toml` with the returned namespace ID
  3. Set secrets: `npx wrangler secret put BOT_TOKEN`, `npx wrangler secret put WEBHOOK_SECRET`
  4. Deploy: `npx wrangler deploy`
  5. Register webhook: `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://medved-bot.<subdomain>.workers.dev/&secret_token=<SECRET>"`
  6. Verify: `curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"`
- **Acceptance**: Bot responds to `/start` on Telegram. Full callback flow works end-to-end.

### Step 10: Add scripts for bot development

- **Complexity**: S
- **Files**: `package.json` (root), `packages/bot/package.json`
- **What**:
  1. Add to `packages/bot/package.json`:
     - `"dev": "wrangler dev"`
     - `"deploy": "wrangler deploy"`
     - `"check": "tsc --noEmit"`
  2. Add to root `package.json`:
     - `"bot:dev": "yarn dev -w packages/bot"`
     - `"bot:deploy": "yarn deploy -w packages/bot"`
- **Acceptance**: `yarn bot:dev` starts the bot locally. `yarn bot:deploy` deploys to Cloudflare.

## NFR Considerations

- **Performance**: No impact on the Astro site — the bot is a separate Worker. Bot response time is limited by Telegram API latency (~100-300ms), not Worker compute. 10ms CPU free tier is sufficient for session lookup + API call.
- **SEO**: N/A — the bot is not a web page.
- **Accessibility**: Bot messages use clear, simple Russian text. Phone numbers are provided in a clickable format. Contact sharing button provides an accessible alternative to typing a phone number.
- **Mobile**: Telegram bots are inherently mobile-friendly (Telegram handles the UI). Inline keyboards are touch-optimized.
- **Security**:
  - `WEBHOOK_SECRET` prevents spoofed webhook calls (Telegram sends `X-Telegram-Bot-Api-Secret-Token` header, grammY validates it)
  - `BOT_TOKEN` stored as a Worker secret, never in code
  - Rate limiting via session timestamps prevents spam
  - Phone number input is validated (basic format check) before forwarding
  - User input is sent as plain text to Telegram API (not interpolated into HTML), avoiding injection

## Testing Approach

- [ ] Local dev with `wrangler dev` + Telegram test bot (create a separate bot via @BotFather for dev)
- [ ] `/start` shows welcome message with 3 menu buttons
- [ ] Full callback flow: tap button → enter name → enter phone → owner notified
- [ ] Services list displays with clickable links to website
- [ ] Contacts shows address, phone, hours
- [ ] Free-form message forwards to owner
- [ ] Rate limiting rejects rapid-fire requests
- [ ] Invalid phone format is caught and user is re-prompted
- [ ] Webhook secret verification rejects unauthorized POST requests
- [ ] `yarn check` passes in both root and bot workspace

## Open Questions

- [ ] **Bot username**: What should the Telegram bot username be? (e.g., `@medved_autoelectric_bot`)
- [ ] **Owner notification target**: Should notifications go to a private chat with the owner or a Telegram group? (Group allows multiple staff to see requests)
- [ ] **Working hours**: What are the business hours to display in the contacts handler?
- [ ] **Service list**: Confirm the list of services to show in the bot (can start with whatever is in the services content collection)
- [ ] **Cancel flow**: Should users be able to cancel mid-flow in the callback request? (Recommend yes — a "Отмена" button)

## Follow-up Tasks

- [ ] Dynamic service list pulled from the website's Content Collections at build time (generate a JSON file that the bot reads, or share data via a common package)
- [ ] Analytics: track how many callback requests come via bot vs website form
- [ ] Auto-reply outside working hours ("Мы ответим в рабочее время")
- [ ] Callback form on the website reused to also send via the same Worker (shared validation logic)
- [ ] Add bot link to the website header/footer and contact page
