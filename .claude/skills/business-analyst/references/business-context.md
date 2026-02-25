# Business Context

## Business

- **Service**: BMW auto electrician (diagnostics, wiring repair, generator repair, etc.)
- **Location**: Saint Petersburg, Russia
- **Owner**: Individual specialist / small team
- **Revenue model**: Service fees, no public pricing ("contact for a quote")
- **Lead capture**: Callback request form (name + phone) with instant Telegram notification; prominent phone CTA; WhatsApp/Telegram messenger links

## Target Audience

- BMW owners in Saint Petersburg searching for auto electrician services
- Primary device: mobile (searching on the go, often on 4G)
- Language: Russian only
- Typical search queries: "автоэлектрик BMW СПб", "ремонт проводки BMW", "диагностика электрики BMW"
- Decision factors: trust (reviews, experience), convenience (location, quick callback), expertise (BMW specialization)

## Goals

1. **Generate leads** — callback form submissions and direct calls/messages
2. **Build trust** — testimonials, service descriptions, about page with certifications
3. **SEO visibility** — rank for BMW electrical service queries in Saint Petersburg
4. **Content marketing** — blog posts answering common BMW electrical questions to attract organic traffic

## Competitive Landscape

- Competitors: general auto electricians, BMW dealerships, independent BMW specialists
- Reference site: autoelectric-spb.ru (similar service structure)
- Differentiation: BMW-only specialization, fast response via Telegram, detailed service descriptions

## Site Sections

| Section | Purpose |
|---|---|
| Homepage | Hero + services overview + testimonials + CTA |
| Services (`/uslugi/`) | Detailed service pages (diagnostics, wiring, generator, etc.) |
| Blog (`/blog/`) | SEO content — how-to guides, common issues, tips for BMW owners |
| Testimonials (`/otzyvy/`) | Social proof from real customers |
| About (`/o-nas/`) | Experience, certifications, photo — builds trust |
| Contacts (`/kontakty/`) | Address, map, phone, messengers |

## Constraints

- Russian-only content (no i18n)
- Mobile-first (primary audience searches on phones)
- Zero JS by default (Astro islands only where interactive)
- Small scale: ~12 service pages, under 100 blog posts, handful of testimonials
- Free tier hosting (Cloudflare Pages: unlimited bandwidth, 100K Worker requests/day)
- 2 CMS users max (Tina CMS free tier)
