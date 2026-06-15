"use client";

import { lazy, Suspense } from "react";

import type { ComponentType, ReactNode } from "react";

type ComponentPreviewProps = {
  componentName: string;
};

// Simple text-based preview for components that need complex context
function SimplePreview({ description }: { description: string }) {
  return (
    <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
      <p>{description}</p>
    </div>
  );
}

// Graceful fallback for components without a dedicated preview: a muted wordmark
// tile derived from the component slug, so gallery cards still look intentional.
function PlaceholderPreview({ componentName }: { componentName: string }) {
  const label = componentName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * Text descriptions for components whose live preview needs context the
 * gallery cannot provide. Rendered through SimplePreview.
 */
const SIMPLE_PREVIEWS: Record<string, string> = {
  "anchor-port": "Connection port primitive for object graph cards and edges.",
  "canvas-shell": "Overlay shell for infinite-canvas workspaces with floating chrome regions.",
  "canvas-view": "Pan-and-zoom canvas surface with keyboard and modified-wheel controls.",
  "completion-dialog": "A dialog for displaying completion status with confetti animation.",
  "connector-edge": "Curved connector edge for linking spatial objects on the canvas.",
  "content-intro": "An introduction section with progress tracking and action buttons.",
  "edge-label": "Compact edge annotation badge used inside connector paths.",
  "filter-bar": "A filter bar with search, sort, and filter controls.",
  "group-hull": "Dashed grouping surface for related spatial objects.",
  "left-rail": "Primary left-side rail for workspace navigation and context controls.",
  "mdx-content": "A component for rendering MDX content with custom styling.",
  "mini-map-panel": "Viewport overview panel showing camera position within the world surface.",
  "model-selector": "A dialog for selecting AI models with search and filtering.",
  "navbar-saas": "A responsive navigation bar for SaaS applications.",
  "object-card": "Object card primitive for spatial entities with metrics, actions, and ports.",
  "object-handle": "Drag/move handle affordance for manipulating canvas objects.",
  "progress-card": "A card component with progress tracking.",
  "right-dock": "Right-side dock for inspector, agent, or activity panels in the workspace shell.",
  "search-dialog": "A command palette style search dialog.",
  "slideshow": "A slideshow with keyboard navigation and progress.",
  "table-of-contents-panel": "A table of contents panel with progress tracking.",
  "top-bar": "Top workspace bar combining title, subtitle, and command surfaces.",
  "tutorial-complete": "A completion screen with achievements and related content.",
  "tutorial-filters": "Filter controls for tutorial listings.",
  "tutorial-intro-content": "An introduction component for tutorials with objectives.",
  "tutorial-mdx": "MDX components optimized for tutorial content.",
  "workspace-switcher": "Workspace selector for moving between orchestration views and object neighborhoods.",
  "zoom-hud": "Heads-up zoom control for resetting and stepping canvas magnification.",
};

/**
 * Lazily-loaded live previews, one chunk per component, so a page only
 * downloads the previews it actually shows. Adding a preview is additive:
 * create previews/<slug>.tsx and register it here.
 */
const PREVIEWS: Record<string, ComponentType> = {
  "accordion": lazy(() => import("./previews/accordion")),
  "activity-heatmap": lazy(() => import("./previews/activity-heatmap")),
  "activity-log": lazy(() => import("./previews/activity-log")),
  "alert": lazy(() => import("./previews/alert")),
  "alert-dialog": lazy(() => import("./previews/alert-dialog")),
  "animated-text": lazy(() => import("./previews/animated-text")),
  "area-chart": lazy(() => import("./previews/area-chart")),
  "aspect-ratio": lazy(() => import("./previews/aspect-ratio")),
  "avatar": lazy(() => import("./previews/avatar")),
  "avatar-group": lazy(() => import("./previews/avatar-group")),
  "badge": lazy(() => import("./previews/badge")),
  "bar-chart": lazy(() => import("./previews/bar-chart")),
  "blog-card": lazy(() => import("./previews/blog-card")),
  "border-beam": lazy(() => import("./previews/border-beam")),
  "breadcrumb": lazy(() => import("./previews/breadcrumb")),
  "button": lazy(() => import("./previews/button")),
  "calendar": lazy(() => import("./previews/calendar")),
  "callout": lazy(() => import("./previews/callout")),
  "card": lazy(() => import("./previews/card")),
  "carousel": lazy(() => import("./previews/carousel")),
  "category-filter": lazy(() => import("./previews/category-filter")),
  "checkbox": lazy(() => import("./previews/checkbox")),
  "checklist": lazy(() => import("./previews/checklist")),
  "code-block": lazy(() => import("./previews/code-block")),
  "code-playground": lazy(() => import("./previews/code-playground")),
  "collapsible": lazy(() => import("./previews/collapsible")),
  "combobox": lazy(() => import("./previews/combobox")),
  "command": lazy(() => import("./previews/command")),
  "comparison": lazy(() => import("./previews/comparison")),
  "context-menu": lazy(() => import("./previews/context-menu")),
  "countdown-timer": lazy(() => import("./previews/countdown-timer")),
  "credit-badge": lazy(() => import("./previews/credit-badge")),
  "data-list": lazy(() => import("./previews/data-list")),
  "data-table": lazy(() => import("./previews/data-table")),
  "date-picker": lazy(() => import("./previews/date-picker")),
  "dialog": lazy(() => import("./previews/dialog")),
  "drawer": lazy(() => import("./previews/drawer")),
  "dropdown-menu": lazy(() => import("./previews/dropdown-menu")),
  "exercise": lazy(() => import("./previews/exercise")),
  "faq": lazy(() => import("./previews/faq")),
  "file-upload": lazy(() => import("./previews/file-upload")),
  "flashcard": lazy(() => import("./previews/flashcard")),
  "floating-action-button": lazy(() => import("./previews/floating-action-button")),
  "form": lazy(() => import("./previews/form")),
  "horizontal-scroll-row": lazy(() => import("./previews/horizontal-scroll-row")),
  "hover-card": lazy(() => import("./previews/hover-card")),
  "inline-input": lazy(() => import("./previews/inline-input")),
  "input": lazy(() => import("./previews/input")),
  "input-otp": lazy(() => import("./previews/input-otp")),
  "key-concept": lazy(() => import("./previews/key-concept")),
  "keyboard-shortcuts-help": lazy(() => import("./previews/keyboard-shortcuts-help")),
  "lang-provider": lazy(() => import("./previews/lang-provider")),
  "learning-objectives": lazy(() => import("./previews/learning-objectives")),
  "line-chart": lazy(() => import("./previews/line-chart")),
  "live-feed": lazy(() => import("./previews/live-feed")),
  "market-treemap": lazy(() => import("./previews/market-treemap")),
  "marquee": lazy(() => import("./previews/marquee")),
  "menubar": lazy(() => import("./previews/menubar")),
  "metric-gauge": lazy(() => import("./previews/metric-gauge")),
  "multi-select": lazy(() => import("./previews/multi-select")),
  "navigation-menu": lazy(() => import("./previews/navigation-menu")),
  "number-input": lazy(() => import("./previews/number-input")),
  "number-ticker": lazy(() => import("./previews/number-ticker")),
  "order-book": lazy(() => import("./previews/order-book")),
  "pagination": lazy(() => import("./previews/pagination")),
  "password-input": lazy(() => import("./previews/password-input")),
  "popover": lazy(() => import("./previews/popover")),
  "pro-tip": lazy(() => import("./previews/pro-tip")),
  "profile-section": lazy(() => import("./previews/profile-section")),
  "progress-bar": lazy(() => import("./previews/progress-bar")),
  "quiz": lazy(() => import("./previews/quiz")),
  "radio-group": lazy(() => import("./previews/radio-group")),
  "resizable": lazy(() => import("./previews/resizable")),
  "scope-selector": lazy(() => import("./previews/scope-selector")),
  "scroll-area": lazy(() => import("./previews/scroll-area")),
  "search-bar": lazy(() => import("./previews/search-bar")),
  "segmented-control": lazy(() => import("./previews/segmented-control")),
  "select": lazy(() => import("./previews/select")),
  "separator": lazy(() => import("./previews/separator")),
  "severity-badge": lazy(() => import("./previews/severity-badge")),
  "share-section": lazy(() => import("./previews/share-section")),
  "sheet": lazy(() => import("./previews/sheet")),
  "sidebar": lazy(() => import("./previews/sidebar")),
  "sidebar-provider": lazy(() => import("./previews/sidebar-provider")),
  "sidebar-toggle": lazy(() => import("./previews/sidebar-toggle")),
  "skeleton": lazy(() => import("./previews/skeleton")),
  "slider": lazy(() => import("./previews/slider")),
  "spinner": lazy(() => import("./previews/spinner")),
  "stat-card": lazy(() => import("./previews/stat-card")),
  "status-board": lazy(() => import("./previews/status-board")),
  "status-indicator": lazy(() => import("./previews/status-indicator")),
  "step-by-step": lazy(() => import("./previews/step-by-step")),
  "step-navigation": lazy(() => import("./previews/step-navigation")),
  "table": lazy(() => import("./previews/table")),
  "table-of-contents": lazy(() => import("./previews/table-of-contents")),
  "tabs": lazy(() => import("./previews/tabs")),
  "tags-input": lazy(() => import("./previews/tags-input")),
  "terminal": lazy(() => import("./previews/terminal")),
  "textarea": lazy(() => import("./previews/textarea")),
  "theme-provider": lazy(() => import("./previews/theme-provider")),
  "theme-toggle": lazy(() => import("./previews/theme-toggle")),
  "thinking-block": lazy(() => import("./previews/thinking-block")),
  "tldr-section": lazy(() => import("./previews/tldr-section")),
  "toast": lazy(() => import("./previews/toast")),
  "toggle": lazy(() => import("./previews/toggle")),
  "toggle-group": lazy(() => import("./previews/toggle-group")),
  "tooltip": lazy(() => import("./previews/tooltip")),
  "tutorial-card": lazy(() => import("./previews/tutorial-card")),
  "usage-breakdown": lazy(() => import("./previews/usage-breakdown")),
  "video-embed": lazy(() => import("./previews/video-embed")),
  "view-switcher": lazy(() => import("./previews/view-switcher")),
  "wallet-card": lazy(() => import("./previews/wallet-card")),
  "watchlist": lazy(() => import("./previews/watchlist")),
  "world-clock-bar": lazy(() => import("./previews/world-clock-bar")),
};

export function ComponentPreview({
  componentName,
}: ComponentPreviewProps): ReactNode {
  const LazyPreview = PREVIEWS[componentName];
  if (LazyPreview) {
    return (
      <Suspense fallback={<PlaceholderPreview componentName={componentName} />}>
        <LazyPreview />
      </Suspense>
    );
  }

  const description = SIMPLE_PREVIEWS[componentName];
  if (description) {
    return <SimplePreview description={description} />;
  }

  return <PlaceholderPreview componentName={componentName} />;
}
