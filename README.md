<div align="center">

# @vllnt/ui

**313 accessible React components** built on [Radix UI](https://radix-ui.com) primitives, styled with [Tailwind CSS](https://tailwindcss.com), powered by [CVA](https://cva.style).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![npm](https://img.shields.io/npm/v/@vllnt/ui)](https://www.npmjs.com/package/@vllnt/ui)

[Documentation](https://ui.vllnt.com) · [Storybook](https://storybook.vllnt.ai) · [Registry](https://ui.vllnt.com/components) · [GitHub](https://github.com/vllnt/ui)

</div>

---

## Features

- **313 components** — primitives (Button, Input), composites (Command, DataTable, Carousel), and domain families (AI, Financial, Ops, Educational, Billing, Animation, Maps, Canvas, Timelines)
- **Accessible by default** — Radix UI handles focus, keyboard nav, and ARIA
- **Tailwind CSS + CVA** — variant-driven styling with full theme override via CSS variables
- **shadcn-compatible registry** — install individual components with `shadcn add`
- **TypeScript strict** — fully typed with exported prop interfaces
- **Tested** — unit tests (Vitest) + visual regression (Playwright CT) + Storybook
- **React Native source preview** — 171 experimental native component modules in a separate renderer with shared tokens, native accessibility, and no web runtime dependency

## Install

```bash
pnpm add @vllnt/ui
```

> Published on the public [npm registry](https://www.npmjs.com/package/@vllnt/ui) with signed provenance. See [`packages/ui/README.md`](packages/ui/README.md) for full setup.

### shadcn registry

Install individual components with the [shadcn](https://ui.shadcn.com) CLI — no package dependency, you own the code:

```bash
pnpm dlx shadcn@latest add https://ui.vllnt.com/r/button.json
```

Or by `@vllnt-ui` namespace once it's in the [shadcn registry index](https://ui.shadcn.com/r/registries.json) (add `"@vllnt-ui": "https://ui.vllnt.com/r/{name}.json"` to your `components.json` `registries`):

```bash
pnpm dlx shadcn@latest add @vllnt-ui/button
```

## React Native source preview

The experimental native renderer is separate so React DOM and Radix dependencies never enter Metro. It currently exists in repository source only; `@vllnt/ui-native` has not been published to npm. The planned command becomes actionable only after the native manifest reports package availability:

```bash
pnpm add @vllnt/ui-native@canary
```

```tsx
import { Button, ThemeProvider } from "@vllnt/ui-native";

export function NativeExample() {
  return (
    <ThemeProvider colorScheme="system">
      <Button onPress={() => {}}>Save changes</Button>
    </ThemeProvider>
  );
}
```

The source catalog contains 171 foundation, form, data, content, AI, learning, motion, utility, control, overlay, and navigation modules. Browse the [React Native catalog](https://ui.vllnt.com/components?platform=native), switch to Native on the [unified installation guide](https://ui.vllnt.com/docs/installation?platform=native), or inspect the [machine-readable native manifest](https://ui.vllnt.com/r/native/registry.json). `@vllnt/ui` remains the stable Web renderer with its existing API and release path.

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
pnpm dlx shadcn@latest add https://ui.vllnt.com/r/button.json
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
| `pnpm ci:native` | Verify core/native packages and Expo bundles |
| `pnpm tokens:check` | Check generated web/native token drift |

## Theming

Override CSS variables after importing styles:

```css
:root {
  --primary: 0.45 0.16 255;
  --primary-foreground: 0.98 0 0;
}
```

## Components

<details>
<summary>All 313 components</summary>

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

## AI agents

Building with an AI coding agent? Install the [`vllnt-ui` skill](skills/vllnt-ui/SKILL.md) — it gives agents the component set, design tokens, and usage patterns, pointing to the live registry and [`DESIGN.md`](https://ui.vllnt.com/DESIGN.md) for current detail. Agents working *in this repo* should read [AGENTS.md](AGENTS.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bugs and feature requests: [issues](https://github.com/vllnt/ui/issues). Security: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
