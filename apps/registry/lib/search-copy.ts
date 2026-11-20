import { defaultLocale, type Locale } from "@/i18n/locales";

/**
 * Search-result copy: the `<title>` and meta description written for a query,
 * not for the page's own heading.
 */
export type SearchCopy = {
  /** Meta description, 160 characters at most. */
  readonly description: string;
  /** Full `<title>` including the brand suffix, 60 characters at most. */
  readonly title: string;
};

/**
 * Rewrites of existing page titles and meta descriptions, keyed by the
 * pathname the page passes to `pageMetadata`. A row replaces the page's own
 * `<title>` and meta description on the default locale only; other locales keep
 * their localized copy. The h1 and the social card text are not touched. A
 * component page emits its row as written, without the native title and
 * description wrappers.
 *
 * `/components?platform=native` is the native catalog. `/docs/vision` applies
 * once that page exists.
 */
const SEARCH_COPY = {
  "/": {
    description:
      "VLLNT UI is an accessible React design system built for AI agents: over 300 components, a shadcn-compatible registry, llms.txt and MCP. Native is in preview.",
    title: "Design system for AI agents - React and native | vllnt UI",
  },
  "/build/ai-chat-ui": {
    description:
      "Prebuilt AI chat UI components for React: a prompt composer, message bubbles, streaming text and a sidebar. Wire them to any model. Install with the shadcn CLI.",
    title: "AI chat UI components - prebuilt React chat kit | vllnt UI",
  },
  "/build/tool-calls-agent-steps": {
    description:
      "Agent UI components for React: show each tool call with its input, status and output, the agent's reasoning, and the whole run as a live activity timeline.",
    title: "Agent UI components - tool calls and steps | vllnt UI",
  },
  "/components/ai-tool-call-display": {
    description:
      "Show AI agent tool calls in React: tool name, input, status (queued, running, complete, error), duration and output in one card. Install with the shadcn CLI.",
    title: "Tool call UI for React - show AI agent tool calls | vllnt UI",
  },
  "/components/cookie-consent": {
    description:
      "A React cookie consent banner with accept and decline actions, card or bar layouts and an equal-weight button option. Accessible. Install with the shadcn CLI.",
    title: "React cookie consent banner - accept or decline | vllnt UI",
  },
  "/components/floating-navbar": {
    description:
      "A floating navbar for React that hides on scroll down and returns on scroll up. Stays visible for reduced motion. Install it with one shadcn CLI command.",
    title: "Floating navbar in React - hides on scroll down | vllnt UI",
  },
  "/components/gantt-chart": {
    description:
      "A React Gantt chart component with task bars, progress, milestones and a today line, from day to quarter scales. No chart library. Install with the shadcn CLI.",
    title: "React Gantt chart component - shadcn compatible | vllnt UI",
  },
  "/components/glass-card": {
    description:
      "A glassmorphism React component: a frosted card with backdrop blur and a translucent background, built on your theme tokens. Install it with the shadcn CLI.",
    title: "Glassmorphism React component - frosted card | vllnt UI",
  },
  "/components/globe-3d": {
    description:
      "A shadcn-compatible 3D globe for React, drawn in SVG: auto-rotation, drag, lat/lng markers and great-circle arcs. Install it with one shadcn CLI command.",
    title: "shadcn globe - 3D SVG globe component for React | vllnt UI",
  },
  "/components/liquid-glass": {
    description:
      "A liquid glass surface for shadcn and React: backdrop blur with a slow sheen built on your theme tokens. Stops for reduced motion. Install with the shadcn CLI.",
    title: "Liquid glass for shadcn and React - glass surface | vllnt UI",
  },
  "/components/scroll-area": {
    description:
      "A React scroll area with custom scrollbars, built on Radix. The viewport takes keyboard focus when its content overflows. Install it with the shadcn CLI.",
    title: "React scroll area - custom scrollbars on Radix | vllnt UI",
  },
  "/components/sidebar": {
    description:
      "A collapsible React sidebar for app navigation in Next.js: titled sections, collapsible groups and current-page matching. Install it with the shadcn CLI.",
    title: "React sidebar component - collapsible navigation | vllnt UI",
  },
  "/components/timeline-scrubber": {
    description:
      "A timeline scrubber UI for React: a playback slider on a native range input with milestone ticks, tone variants and value labels. Install with the shadcn CLI.",
    title: "Timeline scrubber UI for React - playback slider | vllnt UI",
  },
  "/components?platform=native": {
    description:
      "React Native components for iOS and Android that share tokens and contracts with the web library. Source preview and canary builds only; no stable release yet.",
    title: "React Native components - iOS, Android, canary | vllnt UI",
  },
  "/design": {
    description:
      "The VLLNT UI DESIGN.md: brand voice, color and type tokens, spacing, component patterns and accessibility rules, in one file that people and AI agents can read.",
    title: "DESIGN.md for AI agents - tokens and UI rules | vllnt UI",
  },
  "/docs/agents": {
    description:
      "Use VLLNT UI from an AI coding agent: llms.txt, llms-full.txt, an MCP server with component search, and one JSON descriptor per component in the registry.",
    title: "UI library for AI coding agents - llms.txt, MCP | vllnt UI",
  },
  "/docs/theming": {
    description:
      "Theme a React app with CSS variables: OKLCH design tokens, dark mode, product themes switched at runtime with data-theme, and local overrides in VLLNT UI.",
    title: "React theming with CSS variables - OKLCH tokens | vllnt UI",
  },
  "/docs/vision": {
    description:
      "Where VLLNT UI is going: one UI layer for spatial interfaces and for streamed, per-user, AI-composed UI. What ships today, and what is still on the roadmap.",
    title: "Generative and spatial UI - the VLLNT UI vision | vllnt UI",
  },
  "/families/ai": {
    description:
      "AI components for React: chat input, message bubbles, streaming text, tool calls, reasoning, citations and approvals. Accessible. Install with the shadcn CLI.",
    title: "AI components for React - chat, agent, streaming | vllnt UI",
  },
  "/themes": {
    description:
      "A shadcn theme generator: tune OKLCH colors and radius, preview components live, then export the theme as CSS variables, a shadcn CLI command or design tokens.",
    title: "shadcn theme generator - OKLCH, live preview | vllnt UI",
  },
  "/vs/vercel-ai-sdk": {
    description:
      "The AI SDK (by Vercel) streams model output and tool calls. VLLNT UI renders them. What each one does, where they meet, and how to use both in one React app.",
    title: "VLLNT UI and the AI SDK - components and runtime | vllnt UI",
  },
} satisfies Record<string, SearchCopy>;

/** Pathnames that have a row in the search copy table. */
export type SearchCopyPath = keyof typeof SEARCH_COPY;

const COPY_BY_PATH = new Map<string, SearchCopy>(Object.entries(SEARCH_COPY));

/**
 * The row of a page that is known to have one. Hand-written entries
 * (`ai-seo`, `component-seo`) use this so the copy is written once.
 *
 * @param pathname - a key of the search copy table
 * @returns The title and meta description of that page
 * @example
 * searchCopyFor("/components/gantt-chart").title;
 */
export function searchCopyFor(pathname: SearchCopyPath): SearchCopy {
  return SEARCH_COPY[pathname];
}

/**
 * The search copy of a page, if it has a row and the locale is the default.
 *
 * @param pathname - pathname of the page, as passed to `pageMetadata`
 * @param locale - locale of the page
 * @returns The row, or `undefined` for a page without one or a non-default locale
 * @example
 * getSearchCopy("/design", "en")?.title;
 */
export function getSearchCopy(
  pathname: string,
  locale: Locale,
): SearchCopy | undefined {
  return locale === defaultLocale ? COPY_BY_PATH.get(pathname) : undefined;
}

/**
 * Every row of the search copy table, for tests and audits.
 *
 * @returns Pathname and copy pairs
 */
export function listSearchCopy(): readonly (readonly [string, SearchCopy])[] {
  return [...COPY_BY_PATH.entries()];
}
