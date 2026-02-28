# Blog Stack Decisions

## Summary

| Decision | Choice | Runner-up |
|---|---|---|
| SSG Framework | Astro | Eleventy (11ty) |
| Content Format | Markdown + Astro Content Collections | MDX |
| CMS | Tina CMS | Decap CMS |
| Hosting | Cloudflare Pages | Vercel |
| CI/CD | Cloudflare Pages built-in | GitHub Actions |
| Package Manager | yarn | npm |
| Form Backend | Cloudflare Workers → Telegram Bot | Email via Resend |
| Telegram Bot | Cloudflare Workers (webhook) + grammY | Railway / VPS |

## Requirements

- **Topic & audience**: BMW auto electrician service site targeting car owners in Saint Petersburg
- **Site type**: Service site with blog (not blog-only) — modeled after sites like autoelectric-spb.ru
- **Language**: Russian only
- **Interactivity**: Text and images; lead-capture forms (callback request, messenger links)
- **Authors**: Multiple writers needing a visual editing experience (CMS required)
- **Scale**: Small — a dozen service pages, handful of testimonials, growing blog (under 100 posts)
- **i18n**: Not needed, single language (Russian)
- **Growth**: Service pages + blog for SEO; no app features planned
- **Lead capture**: Callback request form → Telegram bot notification; prominent phone CTA; WhatsApp/Telegram links
- **Pricing**: Not shown publicly — "contact for a quote"
- **Testimonials**: Manually managed as content
- **Domain**: `bmw-electric-spb.ru`

## Decisions

### SSG Framework: Astro

**Why**: Astro ships zero JavaScript by default, giving the fastest possible page loads — critical for mobile users searching "автоэлектрик BMW СПб" on 4G. Content Collections handle multiple content types (services, testimonials, blog) with type-safe Zod schemas. Built-in image optimization, sitemap, and RSS integrations cover SEO needs out of the box.

**Trade-offs**: Smaller ecosystem than Next.js/React. If the site ever needs heavy app-like features (user accounts, booking system), Astro's island architecture may not be enough.

**Migration path**: Astro supports React, Vue, and Svelte components as islands. Content is portable markdown files that work with any framework.

### Content Format: Markdown + Astro Content Collections

**Why**: Plain markdown is the most portable, CMS-compatible format. Writers use Tina's visual editor and never touch raw markdown. Astro Content Collections provide type-safe frontmatter validation via Zod schemas for each content type.

**Directory structure**:
```
content/
  services/
    diagnostika-elektriki/
      index.md
      hero.jpg
    remont-provodki/
      index.md
      hero.jpg
    remont-generatora/
      index.md
      hero.jpg
  testimonials/
    ivan-petrov.md
    sergey-sidorov.md
  blog/
    kak-proverit-generator-bmw/
      index.md
      hero.jpg
    chastye-neispravnosti-e90/
      index.md
      hero.jpg
  pages/
    about.md
```

**Frontmatter schemas**:
```typescript
// Services collection
const services = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    order: z.number().default(0),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Blog collection
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    description: z.string().max(160),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

// Testimonials collection
const testimonials = defineCollection({
  schema: z.object({
    author: z.string(),
    car: z.string(),           // e.g. "BMW E90 320i"
    date: z.date(),
    rating: z.number().min(1).max(5).default(5),
  }),
});
```

### CMS: Tina CMS

**Why**: Tina CMS provides visual, on-page editing that non-technical writers can use comfortably — they see the page as it will look, not raw markdown. Content stays in the Git repository as markdown files, meaning no external database dependency and full version history. Free for up to 2 users.

**Trade-offs**: Limited to 2 users on the free tier. Less mature than Sanity for complex structured content. The editing UI is in English (not Russian), though it's visual enough to be intuitive regardless.

**Migration path**: Since content is stored as standard markdown files in Git, switching to another CMS (Decap, Sanity, or even no CMS) requires no content migration — only the editing interface changes.

### Hosting: Cloudflare Pages

**Why**: Cloudflare operates the largest global CDN with edge nodes in Russia, providing the best latency for Saint Petersburg users. The free tier includes **unlimited bandwidth** — the only major platform offering this. Cloudflare Workers (included free, 100K requests/day) handle the callback form backend without needing a separate server. Deploy previews are included per PR.

**Free tier limits**:
- 500 builds/month
- Unlimited bandwidth
- 100,000 Worker requests/day
- 1 build at a time (concurrent builds are paid)
- 25MB max file size

**Custom domain setup**:
1. Add domain in Cloudflare Pages project settings
2. If domain DNS is already on Cloudflare — automatic, instant setup
3. If domain is elsewhere — add CNAME record pointing to `<project>.pages.dev`
4. SSL provisioned automatically

### Form Backend: Cloudflare Workers → Telegram Bot

**Why**: The callback request form (name + phone number) needs to deliver notifications instantly. A Cloudflare Worker receives the form POST, validates input, and sends a message to a Telegram bot — the owner gets an instant push notification on their phone. No external form service needed, runs on the same free Cloudflare account as the hosting.

**How it works**:
1. User fills out callback form (name, phone, optional message)
2. Form POSTs to a Cloudflare Worker endpoint (`/api/callback`)
3. Worker validates input and rate-limits (prevent spam)
4. Worker sends message via Telegram Bot API to a private chat/group
5. Owner receives instant push notification on Telegram

**Trade-offs**: Requires creating a Telegram bot (via @BotFather, takes 2 minutes). If Telegram is unavailable, form submissions are lost unless we add a fallback (email or KV storage). Can add email fallback via Resend or Mailgun later.

**Rate limiting**: 3 requests per IP per hour to prevent abuse (implemented in Worker with Cloudflare KV or in-memory).

### Build & CI/CD: Cloudflare Pages Built-in

**Why**: Cloudflare Pages auto-detects Astro projects and handles the full build pipeline. Push to `main` triggers auto-deploy; pull requests get preview URLs. 500 builds/month is plenty for a small site. No separate CI config to maintain.

**Pipeline stages**:
1. Push to GitHub triggers Cloudflare Pages webhook
2. Cloudflare installs dependencies (`yarn install`)
3. Runs Astro build (`yarn build`)
4. Deploys to Cloudflare's edge CDN globally
5. Preview URL generated for PRs

**Estimated build time**: Under 30 seconds for a small Astro site.

### Package Manager: yarn

**Why**: yarn provides deterministic installs via `yarn.lock`, a cleaner CLI output, and faster install times compared to npm. Cloudflare Pages detects `yarn.lock` and uses yarn automatically. The project migrated from pnpm → npm → yarn as the team settled on a preferred workflow.

**Trade-offs**: Requires yarn to be installed globally (unlike npm which ships with Node.js). Uses flat `node_modules` like npm.

**See also**: [ADR-001](adr/001-switch-pnpm-to-npm.md) for the original pnpm → npm migration, then superseded by the switch to yarn.

### Interactive Telegram Bot: Cloudflare Workers + grammY

**Why**: An interactive Telegram bot lets potential clients request callbacks, browse services, and get contact info directly in Telegram — an additional lead capture channel. Hosting it on Cloudflare Workers (webhook mode) keeps the entire stack on one platform with zero additional cost.

**How it works**:
1. Bot is registered with Telegram via @BotFather
2. Telegram webhook points to a Cloudflare Worker URL
3. When a user messages the bot, Telegram POSTs the update to the Worker
4. grammY framework processes the update, manages session state via Cloudflare KV
5. Bot replies via Telegram Bot API

**Tech stack**:
- **grammY** framework with `webhookCallback(bot, "cloudflare-mod")` adapter
- **Cloudflare KV** for session state (which step the user is on in a conversation flow)
- **yarn workspaces** monorepo: bot lives in `packages/bot/` with its own `wrangler.toml`
- Deployed independently from the site via `wrangler deploy`

**Trade-offs**: Workers have 10ms CPU time on free tier (sufficient for this use case). Stateless execution means conversation state must be persisted to KV on every message. Local development requires `wrangler dev` + a test bot.

**See also**: [ADR-002](adr/002-telegram-bot-on-cloudflare-workers.md) for the full decision record.

## Site Structure (Pages)

```
/                          → Homepage (hero, services overview, testimonials, CTA)
/uslugi/                   → Services index page
/uslugi/diagnostika/       → Individual service page
/uslugi/remont-provodki/   → Individual service page
/uslugi/remont-generatora/ → Individual service page
/otzyvy/                   → Testimonials page
/blog/                     → Blog index
/blog/kak-proverit-generator/ → Blog post
/o-nas/                    → About page (experience, certifications, photo)
/kontakty/                 → Contact page (address, map, phone, messengers)
```

## Key UI Components

- **Header**: Logo, phone number (clickable `tel:` link), WhatsApp/Telegram icons, nav menu
- **Hero section**: Headline + CTA button ("Заказать звонок" / "Request callback")
- **Callback form modal**: Name, phone, optional message → Telegram bot
- **Service cards**: Image, title, short description, link to detail page
- **Testimonial cards**: Author, car model, star rating, review text
- **Sticky mobile CTA**: Fixed bottom bar with phone call and WhatsApp buttons on mobile
- **Footer**: Contact info, service area (Saint Petersburg districts), social links

## Next Steps

1. Scaffold the Astro project: `yarn create astro`
2. Set up Content Collections for services, blog, and testimonials
3. Build core layout: header with phone/messenger CTAs, footer, mobile sticky bar
4. Create homepage with hero, services overview, testimonials section
5. Build service page template and populate initial service pages
6. Build blog index and post template
7. Set up Tina CMS: `yarn add tinacms` and configure `tina/config.ts`
8. Create Cloudflare Worker for callback form → Telegram bot
9. Connect GitHub repo to Cloudflare Pages for automatic deployments
10. Configure custom domain when ready
