import type { ComponentCategory } from "@/types/registry";

/**
 * SEO sub-groups for each component family landing page. Each group lists the
 * slugs it holds; `family-groups.test.ts` asserts these slugs stay a complete,
 * non-overlapping cover of each family's registry members, so the hero count and
 * the rendered grid never diverge. Families without an entry fall back to a
 * single flat grid.
 */
export type FamilyGroup = {
  readonly blurb: string;
  readonly heading: string;
  readonly slugs: readonly string[];
};

type FamilyGroupSet = {
  readonly category: ComponentCategory;
  readonly groups: readonly FamilyGroup[];
};

const FAMILY_GROUPS: readonly FamilyGroupSet[] = [
  {
    category: "core",
    groups: [
      {
        blurb:
          "Buttons, copy-to-clipboard controls, toggles, and toolbars for triggering and grouping primary user actions.",
        heading: "Buttons & Actions",
        slugs: ["button", "copy-button", "toggle", "toggle-group", "toolbar"],
      },
      {
        blurb:
          "Core input primitives including text fields, checkboxes, radios, switches, sliders, and labels for capturing user data.",
        heading: "Form Inputs",
        slugs: [
          "input",
          "textarea",
          "checkbox",
          "radio-group",
          "switch",
          "slider",
          "label",
        ],
      },
      {
        blurb:
          "Badges, banners, meters, skeleton loaders, empty states, and cookie consent for surfacing status and system feedback.",
        heading: "Status & Feedback",
        slugs: [
          "badge",
          "banner",
          "meter",
          "skeleton",
          "empty-state",
          "cookie-consent",
        ],
      },
      {
        blurb:
          "Structural primitives like grids, panels, and separators for composing page layout and content surfaces.",
        heading: "Layout & Surfaces",
        slugs: ["grid", "panel", "separator"],
      },
      {
        blurb:
          "Avatars, typography, links, QR codes, and keyboard hints for presenting content and identity.",
        heading: "Content & Display",
        slugs: ["avatar", "typography", "link", "qr-code", "kbd"],
      },
      {
        blurb:
          "Text, heading, display, and prose primitives with token-driven font family, weight, and type scale for consistent typography.",
        heading: "Typography",
        slugs: ["text", "heading", "display", "prose"],
      },
    ],
  },
  {
    category: "form",
    groups: [
      {
        blurb:
          "Typed input fields for text, numbers, passwords, phone numbers, OTP codes, and inline editing.",
        heading: "Text Inputs",
        slugs: [
          "text-field",
          "inline-input",
          "input-group",
          "input-otp",
          "number-input",
          "password-input",
          "phone-input",
        ],
      },
      {
        blurb:
          "Dropdowns, comboboxes, list boxes, and multi-select controls for choosing from predefined options.",
        heading: "Selection Controls",
        slugs: [
          "select",
          "native-select",
          "combobox",
          "multi-select",
          "list-box",
          "segmented-control",
          "button-group",
          "checkbox-group",
        ],
      },
      {
        blurb:
          "Tag editors, color pickers, and scoped selectors for specialized selection and entry tasks.",
        heading: "Tags & Custom Pickers",
        slugs: ["tag-group", "tags-input", "color-picker", "scope-selector"],
      },
      {
        blurb:
          "Search bars, search fields, filter bars, and category filters for querying and narrowing content lists.",
        heading: "Search & Filtering",
        slugs: ["category-filter", "filter-bar", "search-bar", "search-field"],
      },
      {
        blurb:
          "Calendars, date pickers, range pickers, and time selectors for capturing dates, times, and playback ranges.",
        heading: "Date & Time",
        slugs: [
          "calendar",
          "range-calendar",
          "date-field",
          "date-picker",
          "date-range-picker",
          "time-field",
          "time-picker",
          "timeline-scrubber",
        ],
      },
      {
        blurb:
          "Form wrappers, fields, fieldsets, item rows, and file uploads for composing and validating complete forms.",
        heading: "Form Structure",
        slugs: [
          "form",
          "field",
          "fieldset",
          "item",
          "file-upload",
          "newsletter-signup",
        ],
      },
    ],
  },
  {
    category: "overlay",
    groups: [
      {
        blurb:
          "Modal dialogs for confirming actions, focusing attention, and sharing content, including alert and share dialogs.",
        heading: "Modal Dialogs",
        slugs: ["alert-dialog", "dialog", "share-dialog"],
      },
      {
        blurb:
          "Edge-anchored drawers and sheets for secondary content and mobile-friendly slide-out navigation.",
        heading: "Slide-Out Panels",
        slugs: ["drawer", "sheet"],
      },
      {
        blurb:
          "Command palettes and context, dropdown, and right-click menus for quick keyboard-driven actions.",
        heading: "Menus & Commands",
        slugs: ["command", "context-menu", "dropdown-menu"],
      },
      {
        blurb:
          "Floating popovers, hover cards, and tooltips for contextual hints and on-hover content previews.",
        heading: "Popovers & Tooltips",
        slugs: ["popover", "hover-card", "tooltip", "animated-tooltip"],
      },
      {
        blurb:
          "Transient toasts, canvas edge labels, and zoom HUD controls for feedback and on-canvas overlays.",
        heading: "Notifications & Overlays",
        slugs: ["toast", "edge-label", "zoom-hud"],
      },
    ],
  },
  {
    category: "navigation",
    groups: [
      {
        blurb:
          "Top-level header bars, menu bars, and site chrome for orienting users across React and Next.js apps.",
        heading: "Navigation Bars",
        slugs: [
          "navbar-saas",
          "navigation-menu",
          "menubar",
          "floating-navbar",
          "top-bar",
        ],
      },
      {
        blurb:
          "Collapsible sidebars, vertical rails, and side docks for persistent app and canvas navigation.",
        heading: "Sidebars & Rails",
        slugs: [
          "sidebar",
          "sidebar-provider",
          "sidebar-toggle",
          "left-rail",
          "right-dock",
        ],
      },
      {
        blurb:
          "macOS-style docks and pinned bottom bars that host quick actions and calm canvas chrome.",
        heading: "Docks & Bottom Bars",
        slugs: ["dock", "jarvis-dock", "bottom-bar"],
      },
      {
        blurb:
          "Tabs, view switchers, and saved-view bookmarks for toggling between panels, workspaces, and layouts.",
        heading: "Tabs & Views",
        slugs: [
          "tabs",
          "animated-tabs",
          "view-switcher",
          "workspace-switcher",
          "viewport-bookmarks",
        ],
      },
      {
        blurb:
          "Breadcrumb trails, pagination, step navigation, and scroll rows for moving through paged and hierarchical content.",
        heading: "Breadcrumbs & Paging",
        slugs: [
          "breadcrumb",
          "world-breadcrumbs",
          "pagination",
          "step-navigation",
          "horizontal-scroll-row",
        ],
      },
    ],
  },
  {
    category: "data",
    groups: [
      {
        blurb:
          "Area, bar, line, pie, radar, gauge, sankey, and flow charts for visualizing any dataset.",
        heading: "Charts & Graphs",
        slugs: [
          "area-chart",
          "bar-chart",
          "line-chart",
          "pie-chart",
          "radar-chart",
          "gauge-chart",
          "sankey-chart",
          "flow-diagram",
        ],
      },
      {
        blurb:
          "Candlestick charts, order books, treemaps, ticker tapes, and watchlists for financial and market data.",
        heading: "Market & Trading",
        slugs: [
          "candlestick-chart",
          "order-book",
          "market-treemap",
          "ticker-tape",
          "watchlist",
        ],
      },
      {
        blurb:
          "Sortable data tables, key-value lists, and side-by-side comparisons for structured records.",
        heading: "Tables & Lists",
        slugs: [
          "data-table",
          "table",
          "data-list",
          "usage-breakdown",
          "comparison",
        ],
      },
      {
        blurb:
          "Stat cards, metric gauges, sparklines, progress bars, and overview boards for headline metrics and dashboards.",
        heading: "Metrics & KPIs",
        slugs: [
          "stat-card",
          "metric-cluster",
          "metric-gauge",
          "sticky-metric",
          "threshold-ring",
          "sparkline-grid",
          "overview-board",
          "progress-bar",
          "progress-card",
        ],
      },
      {
        blurb:
          "Status boards, indicators, severity badges, alerts, and timers for real-time operational health.",
        heading: "Status & Signals",
        slugs: [
          "status-board",
          "status-indicator",
          "severity-badge",
          "alert",
          "countdown-timer",
          "presence-sync-indicator",
        ],
      },
      {
        blurb:
          "Activity feeds, heatmaps, timelines, live streams, and presence avatars for monitoring what is happening and who is online.",
        heading: "Activity & Presence",
        slugs: [
          "activity-heatmap",
          "activity-log",
          "contribution-graph",
          "live-feed",
          "bottom-activity-strip",
          "run-timeline",
          "heat-overlay",
          "gantt-chart",
          "mini-map-panel",
          "world-clock-bar",
          "avatar-group",
          "presence-stack",
        ],
      },
    ],
  },
  {
    category: "data-display",
    groups: [
      {
        blurb:
          "Choropleth maps, 3D globes, route maps, and geographic heat maps for spatial and geospatial data.",
        heading: "Maps & Geography",
        slugs: [
          "choropleth-map",
          "geography-quiz-map",
          "globe-3d",
          "heat-map-overlay",
          "map-2d",
          "map-timeline",
          "route-map",
          "story-map",
        ],
      },
      {
        blurb:
          "Chronological, historical, and interactive multi-track timelines for sequencing events over time.",
        heading: "Timelines",
        slugs: [
          "chronological-timeline",
          "historic-timeline",
          "interactive-timeline",
        ],
      },
      {
        blurb:
          "Beams, beacons, selection halos, snap guides, and follow-mode chrome for interactive spatial canvases.",
        heading: "Canvas Overlays",
        slugs: [
          "animated-beam",
          "follow-mode",
          "handoff-beacon",
          "selection-halo",
          "snap-guides",
        ],
      },
      {
        blurb:
          "Scroll and glass progress bars plus floating toolbars for reading state and contextual selection actions.",
        heading: "Progress & Toolbars",
        slugs: ["glass-progress", "scroll-progress", "floating-toolbar"],
      },
      {
        blurb:
          "Tree views and primary-source document viewers for exploring nested data and archival source material.",
        heading: "Documents & Hierarchy",
        slugs: ["tree-view", "primary-source-viewer"],
      },
    ],
  },
  {
    category: "content",
    groups: [
      {
        blurb:
          "React card and layout components — accordions, bento grids, carousels, and expandable cards for organizing page content.",
        heading: "Cards & Layout",
        slugs: [
          "accordion",
          "animated-list",
          "animated-testimonials",
          "bento-grid",
          "blog-card",
          "card",
          "carousel",
          "collapsible",
          "expandable-cards",
          "faq",
          "slideshow",
        ],
      },
      {
        blurb:
          "Animated text effect components for React — blur, shimmer, scramble, typewriter, and scroll-reveal typography.",
        heading: "Text Effects",
        slugs: [
          "blur-reveal",
          "reveal-text",
          "scramble-text",
          "shimmer-text",
          "spinning-text",
          "text-animate",
          "text-reveal",
          "text-shimmer",
          "typewriter",
        ],
      },
      {
        blurb:
          "Content blocks for articles and docs — code blocks, callouts, video embeds, timelines, and MDX rendering.",
        heading: "Article & Media Blocks",
        slugs: [
          "callout",
          "code-block",
          "code-playground",
          "content-intro",
          "document-sibling-nav",
          "mdx-content",
          "share-section",
          "terminal",
          "timeline",
          "tldr-section",
          "video-embed",
        ],
      },
      {
        blurb:
          "Right-dock inspector panels for canvas objects — property grids, relationships, routing, and runtime overviews.",
        heading: "Canvas Inspectors",
        slugs: [
          "object-card",
          "object-inspector",
          "policy-delivery-panel",
          "property-section",
          "relationship-inspector",
          "routing-assignment-panel",
          "runtime-overview-panel",
        ],
      },
      {
        blurb:
          "Account and billing status components — plan, role, and credit badges plus subscription and wallet cards.",
        heading: "Account & Billing Badges",
        slugs: [
          "credit-badge",
          "plan-badge",
          "role-badge",
          "subscription-card",
          "wallet-card",
        ],
      },
    ],
  },
  {
    category: "learning",
    groups: [
      {
        blurb:
          "Tutorial and curriculum components for building courses, lesson browsers, and guided onboarding tours.",
        heading: "Tutorials & Curriculum",
        slugs: [
          "curriculum",
          "tour",
          "tutorial-card",
          "tutorial-complete",
          "tutorial-filters",
          "tutorial-intro-content",
          "tutorial-mdx",
        ],
      },
      {
        blurb:
          "Interactive quiz, exercise, and flashcard components with ratings for active-recall learning.",
        heading: "Quizzes & Exercises",
        slugs: ["quiz", "exercise", "flashcard", "rating"],
      },
      {
        blurb:
          "Learning progress components — checklists, steppers, progress trackers, and completion dialogs for tracking course advancement.",
        heading: "Progress & Steps",
        slugs: [
          "checklist",
          "completion-dialog",
          "progress-tracker",
          "step-by-step",
          "stepper",
        ],
      },
      {
        blurb:
          "Study aid components — annotations, key-concept blocks, pro tips, and learning objectives for educational content.",
        heading: "Study Aids & Callouts",
        slugs: ["annotation", "key-concept", "learning-objectives", "pro-tip"],
      },
      {
        blurb:
          "Learner utility components — profile sections, search dialogs, and keyboard shortcut helpers for learning platforms.",
        heading: "Learner Utilities",
        slugs: ["profile-section", "search-dialog", "keyboard-shortcuts-help"],
      },
    ],
  },
  {
    category: "educational",
    groups: [
      {
        blurb:
          "Historical reference components — civilization overviews, historical figure profiles, and side-by-side era comparisons.",
        heading: "Historical Reference Cards",
        slugs: [
          "civilization-card",
          "era-comparison",
          "historical-figure-card",
        ],
      },
      {
        blurb:
          "Comparative history timelines and inline knowledge-check quizzes for teaching historical eras.",
        heading: "History Timelines & Quizzes",
        slugs: ["parallel-timeline", "knowledge-check"],
      },
    ],
  },
  {
    category: "utility",
    groups: [
      {
        blurb:
          "Decorative animated backgrounds — grid, dot, particle, meteor, and sparkle effects that add ambient motion behind any React section.",
        heading: "Background Effects",
        slugs: [
          "animated-grid-pattern",
          "dot-pattern",
          "meteors",
          "particles",
          "sparkles",
        ],
      },
      {
        blurb:
          "Frosted glass surfaces, animated borders, spotlights, and progressive blur for premium card and panel styling.",
        heading: "Surface & Border Effects",
        slugs: [
          "glass-card",
          "glass-panel",
          "liquid-glass",
          "border-beam",
          "shine-border",
          "spotlight-card",
          "progressive-blur",
        ],
      },
      {
        blurb:
          "Magnetic buttons, 3D card flips, shimmer sheens, animated counters, marquees, and loading spinners that bring pointer-driven motion to your UI.",
        heading: "Motion & Hover Interactions",
        slugs: [
          "card-flip",
          "tilt-card",
          "magnetic",
          "magnetic-button",
          "shimmer-button",
          "shiny-button",
          "cursor",
          "floating-action-button",
          "animated-text",
          "number-ticker",
          "marquee",
          "spinner",
        ],
      },
      {
        blurb:
          "Pan-and-zoom canvas shells, connectors, object handles, and real-time presence cursors for building spatial, multiplayer workspaces.",
        heading: "Canvas Workspace & Collaboration",
        slugs: [
          "canvas-shell",
          "canvas-view",
          "infinite-plane",
          "anchor-port",
          "connector-edge",
          "object-handle",
          "group-hull",
          "context-lens",
          "multi-select-lasso",
          "playback-ghost",
          "alert-pulse",
          "state-badge-overlay",
          "comment-pin",
          "live-cursor",
          "selection-presence",
          "thread-bubble",
        ],
      },
      {
        blurb:
          "Aspect-ratio boxes, resizable panels, custom scroll areas, tables of contents, and text truncation for structuring page layouts.",
        heading: "Layout Helpers",
        slugs: [
          "aspect-ratio",
          "resizable",
          "scroll-area",
          "table-of-contents",
          "table-of-contents-panel",
          "truncated-text",
        ],
      },
      {
        blurb:
          "Light/dark theme toggles, preset switchers, and context providers for theming and internationalization across your app.",
        heading: "Theming & Providers",
        slugs: [
          "lang-provider",
          "theme-preset-provider",
          "theme-provider",
          "theme-switcher",
          "theme-toggle",
        ],
      },
    ],
  },
  {
    category: "billing",
    groups: [
      {
        blurb:
          "Pricing tables, auto-reload controls, and transaction history for subscription billing, credits, and payment management.",
        heading: "Billing & Payments",
        slugs: ["auto-reload", "pricing-table", "transaction-list"],
      },
    ],
  },
  {
    category: "ai",
    groups: [
      {
        blurb:
          "Message bubbles, threaded conversations, and assistant sidebars for building complete AI chat interfaces.",
        heading: "Chat & Conversation",
        slugs: [
          "ai-message-bubble",
          "conversation-thread",
          "ai-sidebar",
          "chat-dock-section",
        ],
      },
      {
        blurb:
          "Auto-growing prompt inputs, chat composers, and reusable prompt template galleries for capturing user instructions.",
        heading: "Prompt Composition",
        slugs: ["ai-chat-input", "prompt-input", "prompt-templates"],
      },
      {
        blurb:
          "Live token streaming, chain-of-thought traces, and collapsible reasoning blocks that reveal how an AI model thinks.",
        heading: "Streaming & Reasoning",
        slugs: [
          "ai-streaming-text",
          "chain-of-thought",
          "reasoning",
          "thinking-block",
        ],
      },
      {
        blurb:
          "Agent activity chains, tool-call traces, and source citations that make AI agent execution transparent and verifiable.",
        heading: "Agent Tools & Citations",
        slugs: ["agent-activity", "ai-tool-call-display", "ai-source-citation"],
      },
      {
        blurb:
          "Rendered AI artifacts, model selectors, and side-by-side model comparison for generated outputs and model choice.",
        heading: "Artifacts & Models",
        slugs: ["ai-artifact", "model-selector", "model-comparison"],
      },
    ],
  },
];

/**
 * Ordered SEO sub-groups for a family, or `undefined` when the family has no
 * grouping (the landing page then renders a single flat grid).
 *
 * @param category - the component category
 */
export function getFamilyGroups(
  category: ComponentCategory,
): readonly FamilyGroup[] | undefined {
  return FAMILY_GROUPS.find((set) => set.category === category)?.groups;
}
