# Demore Technology Solutions

Marketing site for Demore Technology Solutions.

Based in Mentor, Ohio. Serving clients nationwide. Work can be delivered remotely.

## Offers
- Custom websites, landing pages, and ecommerce
- AI-assisted digital marketing and lead-generation systems
- SEO, GEO, AEO, CRO, technical performance, and UX
- Google Analytics, Search Console, and conversion tracking
- Social publishing and content automation
- Google Business Profile and review workflows
- Lead routing, CRM handoffs, custom bots, and business automation

## Stack
TanStack Start, React, Tailwind v4.

## Run
```bash
npm install
npm run dev
```

## Production integrations

- `DATABASE_URL` — durable Postgres/Neon comparison and handoff queue.
- `COMPARISON_SIGNING_SECRET` — signs private report and handoff access. Keep stable after launch.
- `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD` — live Google competitor discovery and licensed organic-traffic estimates.
- `PAGESPEED_API_KEY` — recommended Google PageSpeed Insights quota key. PageSpeed may work at low volume without it.
- `RESEND_API_KEY`, `REPORT_FROM_EMAIL`, `REPORT_RECIPIENT_EMAIL` — customer and internal report delivery.
- `XAI_API_KEY` — on-site Grok assistant and its Web Search tool calls.
- `CRM_HANDOFF_WEBHOOK_URL` — optional CRM/automation webhook. Every ID field in its payload equals the canonical `reportId`.

Google Search Console metrics are intentionally not inferred. They require a separate verified-owner OAuth connection using the read-only Search Console scope.

Email: ryan@demoretechnologysolutions.com
Phone unpublished.
