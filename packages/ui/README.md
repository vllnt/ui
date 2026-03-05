# @vllnt/ui

React component library — 93 components built on Radix UI primitives, Tailwind CSS, and CVA.

## Install

```bash
pnpm add @vllnt/ui
```

### Peer Dependencies

Required:

```bash
pnpm add react react-dom tailwindcss
```

Optional (only if using ThemeProvider, NavbarSaas, or other Next.js-specific components):

```bash
pnpm add next next-themes
```

## Setup

### 1. Tailwind Preset

The library provides a Tailwind preset that includes all required theme colors, animations, and utilities.

```ts
// tailwind.config.ts
import uiPreset from "@vllnt/ui/tailwind-preset";

export default {
  presets: [uiPreset],
  content: [
    "./src/**/*.{ts,tsx}",
    // The preset auto-includes @vllnt/ui content paths
  ],
};
```

The preset configures:
- **Colors**: `primary`, `secondary`, `muted`, `accent`, `destructive`, `background`, `foreground`, `card`, `popover`, `border`, `input`, `ring` — all as `hsl(var(--name))` for theming
- **Border radius**: `lg`, `md`, `sm` via `--radius` CSS variable
- **Animations**: `accordion-down`, `accordion-up`, `shimmer`
- **Font**: `mono` family via `--font-mono` variable
- **Dark mode**: class-based (`darkMode: ["class"]`)
- **Plugin**: `tailwindcss-animate`

### 2. Import Styles

```ts
// app/layout.tsx or your main entry
import "@vllnt/ui/styles.css";
```

This imports Tailwind base/components/utilities + default theme variables + safe-area utilities.

### 3. Use Components

```tsx
import { Button, Card, Badge } from "@vllnt/ui";

export function Example() {
  return (
    <Card>
      <Badge variant="secondary">New</Badge>
      <Button variant="default">Click me</Button>
    </Card>
  );
}
```

## Exports

| Import Path | What |
|-------------|------|
| `@vllnt/ui` | All components, types, and utilities |
| `@vllnt/ui/tailwind-preset` | Tailwind CSS preset config |
| `@vllnt/ui/styles.css` | Full styles (Tailwind base + theme variables + utilities) |
| `@vllnt/ui/themes/default.css` | Theme CSS variables only (no Tailwind base) |

## Theming

All colors use HSL CSS variables. Override them after importing styles:

```css
/* Light theme */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;
}

/* Dark theme (applied via class="dark" on html/body) */
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... override other variables */
}
```

Use `@vllnt/ui/themes/default.css` instead of `@vllnt/ui/styles.css` if you only want the variables without Tailwind base layer styles.

## Component Patterns

All components follow these conventions:

- **`React.forwardRef`** — every component forwards refs
- **`React.ComponentPropsWithoutRef`** — extends native HTML element props
- **`cn()` utility** — merges Tailwind classes via `clsx` + `tailwind-merge`
- **CVA variants** — variant props defined with `class-variance-authority`
- **Radix primitives** — accessible behavior (focus, keyboard, ARIA) via Radix UI
- **Slot support** — `asChild` prop via `@radix-ui/react-slot` for render delegation

### Variant Pattern

```tsx
import { Button } from "@vllnt/ui";

// Button variants: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
// Button sizes: "default" | "sm" | "lg" | "icon"
<Button variant="outline" size="sm">Small Outline</Button>
```

### Composition Pattern

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@vllnt/ui";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

## Components

### Form Controls

| Component | Import | Notes |
|-----------|--------|-------|
| `Button` | `{ Button, buttonVariants }` | Variants: default, destructive, outline, secondary, ghost, link. Sizes: default, sm, lg, icon |
| `Input` | `{ Input }` | Standard text input |
| `Textarea` | `{ Textarea }` | Multi-line text input |
| `Checkbox` | `{ Checkbox }` | Radix checkbox |
| `RadioGroup` | `{ RadioGroup, RadioGroupItem }` | Radix radio group |
| `Select` | `{ Select, SelectTrigger, SelectValue, SelectContent, SelectItem, ... }` | Radix select |
| `Slider` | `{ Slider }` | Radix slider |
| `Switch` | `{ Switch }` | Radix switch |
| `Toggle` | `{ Toggle, toggleVariants }` | Radix toggle |
| `ToggleGroup` | `{ ToggleGroup, ToggleGroupItem }` | Radix toggle group |
| `InputOTP` | `{ InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }` | OTP input via `input-otp` |
| `Label` | `{ Label }` | Radix label |
| `Calendar` | `{ Calendar }` | Date picker via `react-day-picker` |

### Layout

| Component | Import | Notes |
|-----------|--------|-------|
| `Card` | `{ Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }` | Content container |
| `AspectRatio` | `{ AspectRatio }` | Radix aspect ratio |
| `ScrollArea` | `{ ScrollArea, ScrollBar }` | Radix scroll area |
| `Separator` | `{ Separator }` | Radix separator |
| `ResizablePanel` | `{ ResizablePanel, ResizablePanelGroup, ResizableHandle }` | Via `react-resizable-panels` |
| `Collapsible` | `{ Collapsible, CollapsibleTrigger, CollapsibleContent }` | Radix collapsible |
| `Carousel` | `{ Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }` | Via `embla-carousel-react` |
| `Tabs` | `{ Tabs, TabsList, TabsTrigger, TabsContent }` | Tabbed content |
| `Accordion` | `{ Accordion, AccordionItem, AccordionTrigger, AccordionContent }` | Collapsible sections |

### Feedback & Overlays

| Component | Import | Notes |
|-----------|--------|-------|
| `Dialog` | `{ Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose }` | Radix modal dialog |
| `AlertDialog` | `{ AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel }` | Confirmation dialog |
| `Sheet` | `{ Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose }` | Slide-out panel |
| `Drawer` | `{ Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose }` | Bottom drawer via `vaul` |
| `Popover` | `{ Popover, PopoverTrigger, PopoverContent }` | Radix popover |
| `Tooltip` | `{ Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }` | Radix tooltip (wrap app in `TooltipProvider`) |
| `HoverCard` | `{ HoverCard, HoverCardTrigger, HoverCardContent }` | Radix hover card |
| `Toast` | `{ toast, Toaster }` | Toast notifications via `sonner`. Add `<Toaster />` to layout, trigger with `toast()` |
| `Alert` | `{ Alert, AlertTitle, AlertDescription, alertVariants }` | Static alert banner |
| `Badge` | `{ Badge, badgeVariants }` | Inline status label. Variants: default, secondary, destructive, outline |
| `Skeleton` | `{ Skeleton }` | Loading placeholder |
| `Spinner` | `{ Spinner }` | Loading spinner |

### Navigation

| Component | Import | Notes |
|-----------|--------|-------|
| `Command` | `{ Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator }` | Command palette via `cmdk` |
| `DropdownMenu` | `{ DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, ... }` | Radix dropdown |
| `ContextMenu` | `{ ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ... }` | Radix right-click menu |
| `Menubar` | `{ Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, ... }` | Radix menu bar |
| `NavigationMenu` | `{ NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink }` | Radix nav menu |
| `Breadcrumb` | `{ Breadcrumb }` | Breadcrumb navigation |
| `Pagination` | `{ Pagination }` | Page navigation |

### Data Display

| Component | Import | Notes |
|-----------|--------|-------|
| `Table` | `{ Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, TableFooter }` | Data table (use with `@tanstack/react-table` for sorting/filtering) |
| `Avatar` | `{ Avatar, AvatarImage, AvatarFallback }` | Radix avatar |
| `AreaChart` | `{ AreaChart }` | Chart component |
| `BarChart` | `{ BarChart }` | Chart component |
| `LineChart` | `{ LineChart }` | Chart component |
| `CodeBlock` | `{ CodeBlock }` | Syntax-highlighted code via `react-syntax-highlighter` |
| `FlowDiagram` | `{ FlowDiagram }` | Flow diagram via `@xyflow/react` |
| `TableOfContents` | `{ TableOfContents }` | Page table of contents |

### App Components

| Component | Import | Notes |
|-----------|--------|-------|
| `ThemeProvider` | `{ ThemeProvider }` | Requires `next-themes`. Wrap app root |
| `ThemeToggle` | `{ ThemeToggle }` | Light/dark mode toggle. Requires `ThemeProvider` |
| `LangProvider` | `{ LangProvider }` | Language context provider |
| `NavbarSaas` | `{ NavbarSaas }` | Full-featured SaaS navbar. Requires `next` |
| `Sidebar` | `{ Sidebar }` | Collapsible sidebar |
| `SidebarProvider` | `{ SidebarProvider, useSidebar }` | Sidebar state management |
| `SidebarToggle` | `{ SidebarToggle }` | Sidebar expand/collapse button |
| `SearchBar` | `{ SearchBar }` | Search input with filtering |
| `SearchDialog` | `{ SearchDialog }` | Full-screen search dialog |

### Content & Tutorial

| Component | Import | Notes |
|-----------|--------|-------|
| `MDXContent` | `{ MDXContent }` | MDX renderer |
| `TutorialMDX` | `{ TutorialMDX, mdxComponents }` | Tutorial MDX with custom components |
| `Callout` | `{ Callout }` | Info/warning/error callout box |
| `ProTip` | `{ ProTip, CommonMistake }` | Tip and mistake callouts |
| `Quiz` | `{ Quiz }` | Interactive quiz |
| `Exercise` | `{ Exercise }` | Interactive exercise |
| `StepByStep` | `{ StepByStep, Step }` | Numbered step guide |
| `CodePlayground` | `{ CodePlayground, FileTree }` | Code editor with file tree |
| `Terminal` | `{ Terminal, SimpleTerminal }` | Terminal emulator UI |
| `VideoEmbed` | `{ VideoEmbed }` | Responsive video embed |

## Utilities

```tsx
import { cn } from "@vllnt/ui";

// Merge Tailwind classes (clsx + tailwind-merge)
<div className={cn("p-4 bg-primary", isActive && "bg-accent", className)} />
```

```tsx
import { useDebounce } from "@vllnt/ui";

const debouncedValue = useDebounce(searchTerm, 300);
```

## Types

```tsx
import type {
  Content,
  ContentMeta,
  ContentProgress,
  ContentSection,
  DifficultyLevel,
  UISupportedLanguage,
} from "@vllnt/ui";
```

## Requirements

- React >= 18.0.0
- Tailwind CSS >= 3.0.0
- Next.js >= 14.0.0 (optional — only for `ThemeProvider`, `NavbarSaas`, `LangProvider`)
- `next-themes` >= 0.4.0 (optional — only for `ThemeProvider`, `ThemeToggle`)

## License

MIT
