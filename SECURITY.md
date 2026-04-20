# Security Policy

## Supported versions

Only the latest minor of `@vllnt/ui` is actively supported. Please upgrade before reporting.

| Version  | Supported |
|----------|-----------|
| `0.2.x`  | Yes       |
| `< 0.2`  | No        |

## Reporting a vulnerability

**Do not open a public GitHub issue for security problems.**

Please report vulnerabilities privately via one of:

1. **GitHub Private Vulnerability Reporting** (preferred) — open an advisory at <https://github.com/vllnt/ui/security/advisories/new>.
2. As a fallback, open a minimal public issue titled **"Security: please open a private channel"** and a maintainer will invite you to a private advisory thread. Do not include vulnerability details in the public issue.

Include in your report:

- Affected version(s) of `@vllnt/ui`.
- A minimal reproduction (code snippet, repo, or registry URL).
- Impact assessment (what a malicious actor can do).
- Suggested fix, if you have one.

## What to expect

- Acknowledgement within **3 business days**.
- Triage + severity assessment within **7 business days**.
- A fix target aligned with severity (critical → next patch release; high → within 14 days; medium/low → best-effort).
- Credit in the published security advisory and CHANGELOG, unless you ask to remain anonymous.

## Scope

In scope:

- The published `@vllnt/ui` package on the public npm registry.
- Source in `packages/ui/` and `apps/registry/`.
- The published registry API (`https://ui.vllnt.ai/r/*.json`).
- CI workflows that touch publishing or release provenance.

Out of scope:

- Vulnerabilities in third-party dependencies — report upstream. You may open an advisory here if the exploitability is unique to how we compose the dependency.
- Self-XSS, social-engineering, or attacks requiring privileged local access.
- Bugs in example/demo code inside `apps/registry/content/`.

## Safe harbor

We will not pursue legal action against researchers who:

- Make a good-faith effort to avoid privacy violations, service disruption, and data destruction.
- Only interact with accounts they own or have explicit permission to access.
- Report vulnerabilities through the channels above and give us reasonable time to remediate before public disclosure.
