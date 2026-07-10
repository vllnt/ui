# SEO: repositioning ui.vllnt.com as the UI design system for AI agents

GSC-grounded change set that shifts the site from "agent-readable shadcn clone"
(unwinnable on generic component terms) to category owner of **UI for AI agents
/ AI-first apps** — capturing the AI-component long-tail and creating the
category before its search volume arrives.

## What changed (code)

| Area | Change | Files |
|---|---|---|
| Positioning | Homepage/root `<title>`, meta description, keywords lead with "UI design system for AI agents" | `app/[locale]/layout.tsx`, `app/[locale]/page.tsx` |
| Hero | New H1 + subhead + primary CTA to `/ai` (extracted `HeroActions`) | `components/landing/landing.tsx` |
| AI SEO source of truth | Per-component SEO title/description + "when to use" copy, and the AI component family grouped by job-to-be-done | `lib/ai-seo.ts` (new) |
| Component pages | AI components get an SEO `<title>` override, richer meta description, and a "When to use this in an AI app" block linking the hub | `app/[locale]/components/[slug]/page.tsx` |
| Category hub | `/ai` — manifesto, AI component family, agent-surface, FAQ (+`FAQPage` JSON-LD) | `app/[locale]/ai/page.tsx` (new) |
| Use-case pages | `/build/{ai-chat-ui,tool-calls-agent-steps,rag-citations,ai-artifacts,model-comparison}` (+`FAQPage` JSON-LD) | `app/[locale]/build/[slug]/page.tsx`, `lib/use-cases.ts` (new) |
| Comparisons | `/vs/vercel-ai-sdk`, `/vs/assistant-ui` | `app/[locale]/vs/*` (new) |
| AEO | `faqPageLd()` helper | `lib/jsonld.ts` |
| Crawl shaping | sitemap adds `/ai` (0.9), `/build/*` (0.8), `/vs/*`; AI components raised to 0.85, generic lowered to 0.6 | `app/sitemap.ts` |
| Cannibalization | `storybook.vllnt.ai` now serves `robots.txt` Disallow + `X-Robots-Tag: noindex` | `apps/storybook/nginx.conf` |

All pages build (en + fr), typecheck clean, render with zero page errors.

## Remaining manual actions (cannot be coded)

These are off-platform / require account access:

1. **Google Search Console**
   - Submit/confirm `sitemap.xml`.
   - URL Inspection → Request Indexing for `/`, `/ai`, and the top AI component pages (`ai-chat-input`, `ai-tool-call-display`, `agent-activity`, `ai-source-citation`).
   - Track a saved query group filtering `chat|ai|agent|tool|citation|streaming`.
2. **Off-page / authority**
   - List in awesome-lists (`awesome-ai`, `awesome-react-components`, `awesome-llm-apps`), add npm keywords + GitHub topics (`ai-ui`, `agent-ui`, `llm-ui`, `generative-ui`).
   - Cross-post guides (dev.to / Hashnode) with canonical back to ui.vllnt.com; Show HN / r/reactjs launch with the AI-UI angle.
3. **Deploy note**: the storybook noindex only takes effect after `apps/storybook` is rebuilt/redeployed.

## KPIs to watch

- Tier-1 AI component pages at position ≤ 10 (baseline ≈ 1).
- Impressions/clicks on `chat|ai|agent|tool|citation|streaming` queries.
- LLM citations when prompted "UI library for an AI app".
