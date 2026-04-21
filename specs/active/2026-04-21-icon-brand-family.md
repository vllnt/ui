# Icon brand family

## Goal
Define and stage a **brand icon family** for `@vllnt/ui` covering social brands, auth providers, integrations, and payments without mixing those concerns into the system icon layer.

## Related issue
- #125 feat(icon-family): Brand icons — social, auth, payment, integrations

## Constraints
- Repo: `/home/ubuntu/ui`
- Worktree: `/home/ubuntu/ui/.worktrees/icon-brand-family`
- Branch: `feat/icon-brand-family`
- Base: `feat/storybook`
- Follow repo-local `CLAUDE.md`
- Keep this PR scoped to **spec + rollout plan**, not full implementation
- No new dependencies in this planning pass

## Problem statement
Brand marks need different handling from system icons: legal-safe rendering, vendor grouping, monochrome fallbacks, and predictable usage in auth buttons, integration lists, pricing, and social surfaces. The repo has no dedicated family for that.

## Proposed scope
- social: X, LinkedIn, GitHub, Discord, YouTube
- auth: Google, GitHub, Microsoft, Apple, passkey
- integrations: Slack, Notion, Linear, Stripe, Vercel, Supabase
- billing/payments: Visa, Mastercard, Amex, PayPal, bank transfer
- rendering modes: monochrome, neutral, full-brand where explicitly allowed

## Acceptance criteria
- AC-1: define brand icon categories and naming rules
- AC-2: define rendering modes and legal-safe defaults
- AC-3: define package export shape and grouping by vendor type
- AC-4: define Storybook + registry coverage expectations
- AC-5: isolate this family from generic product/system icon concerns

## Likely implementation files later
- `packages/ui/src/icons/brand/*`
- `packages/ui/src/icons/index.ts`
- `packages/ui/src/components/brand-icon/*` or equivalent wrappers
- registry examples for auth buttons, integration cards, pricing/payment surfaces

## Validation for this PR
- docs-only review
- `git diff --check`

## Rollout notes
- Default to neutral rendering to avoid visual noise and legal ambiguity
- Full-color brand rendering should be opt-in, not default
- Keep vendor coverage tied to actual product use, not arbitrary icon inventory growth
