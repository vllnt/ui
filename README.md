<div align="center">

# @vllnt/ui

**93 accessible React components** built on [Radix UI](https://radix-ui.com) primitives, styled with [Tailwind CSS](https://tailwindcss.com), powered by [CVA](https://cva.style).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)

[Documentation](https://ui.vllnt.com) · [Registry](https://ui.vllnt.com/components) · [GitHub](https://github.com/vllnt/ui)

</div>

---

## Features

- **93 components** — from primitives (Button, Input) to composites (Command, DataTable, Carousel)
- **Accessible by default** — Radix UI handles focus, keyboard nav, and ARIA
- **Tailwind CSS + CVA** — variant-driven styling with full theme override via CSS variables
- **shadcn-compatible registry** — install individual components with `shadcn add`
- **TypeScript strict** — fully typed with exported prop interfaces
- **Tested** — unit tests (Vitest) + visual regression (Playwright CT)

## Install

```bash
pnpm add @vllnt/ui
```

> Published on [GitHub Packages](https://github.com/orgs/vllnt/packages). See [`packages/ui/README.md`](packages/ui/README.md) for registry setup.

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
<summary>All 93 components</summary>

| Category | Components |
|----------|------------|
| **Layout** | Aspect Ratio, Card, Carousel, Collapsible, Resizable, Scroll Area, Separator, Tabs |
| **Forms** | Button, Checkbox, Input, Input OTP, Radio Group, Select, Slider, Switch, Textarea, Toggle, Toggle Group |
| **Feedback** | Alert, Alert Dialog, Badge, Calendar, Dialog, Drawer, Hover Card, Popover, Sheet, Skeleton, Spinner, Toast, Tooltip |
| **Navigation** | Breadcrumb, Command, Context Menu, Dropdown Menu, Menubar, Navigation Menu, Pagination, Sidebar, Sidebar Toggle |
| **Data** | Area Chart, Bar Chart, Line Chart, Table, Table of Contents |
| **Content** | Avatar, Blog Card, Callout, Checklist, Code Block, Code Playground, Comparison, FAQ, Flow Diagram, MDX Content, Pro Tip, Profile Section, Terminal, Thinking Block, Video Embed |
| **Tutorial** | Content Intro, Exercise, Key Concept, Learning Objectives, Progress Bar, Progress Card, Quiz, Step-by-Step, Step Navigation, Tutorial Card, Tutorial Complete, Tutorial Filters, Tutorial Intro Content, Tutorial MDX |
| **App** | Category Filter, Completion Dialog, Filter Bar, Floating Action Button, Keyboard Shortcuts Help, Lang Provider, Model Selector, Navbar SaaS, Search Bar, Search Dialog, Share Section, Slideshow, Theme Provider, Theme Toggle, TL;DR Section |

</details>

## License

[MIT](LICENSE)
