<div align="center">

# @vllnt/ui

**144 accessible React components** built on [Radix UI](https://radix-ui.com) primitives, styled with [Tailwind CSS](https://tailwindcss.com), powered by [CVA](https://cva.style).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![npm](https://img.shields.io/npm/v/@vllnt/ui)](https://www.npmjs.com/package/@vllnt/ui)

[Documentation](https://ui.vllnt.ai) · [Storybook](https://storybook.vllnt.ai) · [Registry](https://ui.vllnt.ai/components) · [GitHub](https://github.com/vllnt/ui)

</div>

---

## Features

- **144 components** — primitives (Button, Input), composites (Command, DataTable, Carousel), and domain families (AI, Financial, Ops, Educational, Billing, Animation)
- **Accessible by default** — Radix UI handles focus, keyboard nav, and ARIA
- **Tailwind CSS + CVA** — variant-driven styling with full theme override via CSS variables
- **shadcn-compatible registry** — install individual components with `shadcn add`
- **TypeScript strict** — fully typed with exported prop interfaces
- **Tested** — unit tests (Vitest) + visual regression (Playwright CT) + Storybook

## Install

```bash
pnpm add @vllnt/ui
```

> Published on the public [npm registry](https://www.npmjs.com/package/@vllnt/ui) with signed provenance. See [`packages/ui/README.md`](packages/ui/README.md) for full setup.

## Quick Start

```tsx
import "@vllnt/ui/styles.css";
import { Button, Card, Badge } from "@vllnt/ui";

export default function App() {
  return (
    <Card>
      <Badge variant="secondary">New</Badge>
      <Button variant="default">Get Started</Button>
    </Card>
  );
}
```

### Tailwind Preset

```ts
// tailwind.config.ts
import uiPreset from "@vllnt/ui/tailwind-preset";

export default {
  presets: [uiPreset],
  content: ["./src/**/*.{ts,tsx}"],
};
```

### shadcn Registry

Install individual components directly:

```bash
pnpm dlx shadcn@latest add https://ui.vllnt.ai/r/button.json
```

## Development

```bash
git clone https://github.com/vllnt/ui.git
cd ui
pnpm install
pnpm dev
```

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev servers |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test:once` | Run tests (single run) |
| `pnpm check:circular` | Detect circular imports |

## Theming

Override CSS variables after importing styles:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
}
```

## Components

<details>
<summary>All 144 components</summary>

| Category | Components |
|----------|------------|
| **Primitives (Radix)** | Accordion, Alert Dialog, Aspect Ratio, Avatar, Checkbox, Collapsible, Context Menu, Dialog, Dropdown Menu, Hover Card, Label, Menubar, Navigation Menu, Popover, Radio Group, Scroll Area, Select, Separator, Slider, Switch, Tabs, Toggle, Toggle Group, Tooltip |
| **Layout** | Card, Carousel, Resizable, Sheet, Drawer, Horizontal Scroll Row, View Switcher |
| **Forms** | Button, Input, Input OTP, Inline Input, Number Input, Password Input, Textarea, Date Picker, File Upload, Combobox, Command, Rating |
| **Feedback** | Alert, Badge, Callout, Skeleton, Spinner, Toast, Tour |
| **Navigation** | Breadcrumb, Pagination, Sidebar, Sidebar Provider, Sidebar Toggle, Search Bar, Search Dialog, Keyboard Shortcuts Help, Floating Action Button, Social FAB |
| **Data / Charts** | Area Chart, Bar Chart, Line Chart, Candlestick Chart, Sparkline Grid, Market Treemap, Order Book, Ticker Tape, Metric Gauge, Activity Heatmap, Activity Log, Table, Data Table, Data List, Stat Card, Number Ticker |
| **AI** | AIChatInput, AIMessageBubble, AISourceCitation, AIStreamingText, AIToolCallDisplay, ThinkingBlock |
| **Financial** | Candlestick Chart, Market Treemap, Order Book, Ticker Tape, Wallet Card, Watchlist, Sparkline Grid |
| **Ops / Status** | Status Board, Status Indicator, Live Feed, World Clock Bar, Severity Badge, Role Badge, Scope Selector |
| **Billing / Plans** | Subscription Card, Plan Badge, Credit Badge, Usage Breakdown |
| **Content** | Blog Card, Pro Tip, Callout, Code Block, Code Playground, Comparison, FAQ, Flow Diagram, MDX Content, Profile Section, Terminal, Video Embed, Marquee, Animated Text, Border Beam, Number Ticker, TL;DR Section, Share Section, Share Dialog |
| **Tutorial / Educational** | Content Intro, Exercise, Flashcard, Key Concept, Learning Objectives, Progress Bar, Progress Card, Quiz, Step-by-Step, Step Navigation, Stepper, Tutorial Card, Tutorial Complete, Tutorial Filters, Tutorial Intro Content, Tutorial MDX, Checklist, Annotation, Completion Dialog, Truncated Text, Table of Contents, Table of Contents Panel |
| **App Shell** | Navbar SaaS, Model Selector, Lang Provider, Theme Provider, Theme Toggle, Category Filter, Filter Bar, Cookie Consent, Slideshow, Countdown Timer, Avatar Group |

</details>

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bugs and feature requests: [issues](https://github.com/vllnt/ui/issues). Security: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
