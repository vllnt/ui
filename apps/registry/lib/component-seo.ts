/**
 * Hand-written SEO copy for high-intent component pages — the general
 * counterpart to `ai-seo.ts` (which owns the "UI for AI agents" wedge).
 *
 * The component page (`/components/[slug]`) consumes this to override the
 * document title + meta description, render a usage prose block, emit
 * `FAQPage` structured data (plus a visible FAQ), and link related
 * components. Slugs absent here fall back to the registry title/description
 * and render no extra prose (same as before).
 *
 * Precedence on the page: `ai-seo.ts` wins for the AI wedge, then this, then
 * the registry. Keep copy here, not in the generated `component-metadata.json`
 * (that file is rebuilt by `registry:build` and would overwrite hand copy).
 *
 * Targets come from Search Console data: pages that already earn impressions
 * but rank on page 1-2 (striking distance) or carry real demand for
 * vllnt-distinctive terms (e.g. "react callout", "live cursors").
 */

export type ComponentFaq = {
  /** Factual answer, one to three sentences. */
  readonly answer: string;
  /** The question as a user would search/ask it. */
  readonly question: string;
};

export type ComponentSeo = {
  /** Meta description (~150-160 chars), use-case first. */
  readonly description: string;
  /** 3 Q&A rendered visibly and emitted as FAQPage structured data. */
  readonly faqs: readonly ComponentFaq[];
  /** Related component slugs for internal linking. */
  readonly related: readonly string[];
  /** Registry slug this copy belongs to. */
  readonly slug: string;
  /** Full <title> including the brand suffix — used verbatim. */
  readonly title: string;
  /** Prose for the usage block on the component page. */
  readonly whatItIs: string;
};

/**
 * Per-component SEO copy. Populated from hand-authored, source-verified entries
 * (see the batch authoring in the PR that introduced this file).
 */
export const COMPONENT_SEO: readonly ComponentSeo[] = [
  {
    description:
      "Mark input, output, and bidirectional ports on React canvas nodes. Anchor Port is a color-coded marker with side and state variants. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Anchor Port is a React component that renders a small color-coded marker for the connection points on a canvas node, signaling whether a port is an input, an output, or a bidirectional link. It is pure presentation — the host owns wiring and drag logic.",
        question: "What is Anchor Port?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/anchor-port.json` to install it into your React project via the shadcn CLI, then render the AnchorPort element on a node edge.",
        question: "How do I add Anchor Port?",
      },
      {
        answer:
          "Anchor Port has three tones — input, output, and bidirectional — each with its own color, four side placements (top, right, bottom, left), and three states: idle, active, and blocked. It renders with an image role and a descriptive aria-label by default.",
        question: "What variants does Anchor Port support?",
      },
    ],
    related: ["connector-edge", "object-handle", "canvas-view", "canvas-shell"],
    slug: "anchor-port",
    title: "Anchor Port — node input/output port marker in React | VLLNT UI",
    whatItIs:
      "Anchor Port is a small presentational marker for the connection points on a canvas node. It renders a colored dot that signals whether a port is an input, an output, or bidirectional, using a distinct tone for each. Side props place it on the top, right, bottom, or left edge, and state props show it as idle, active, or blocked. It carries an image role and a descriptive label, so screen readers announce each port. Reach for it when wiring node-based editors or flow diagrams.",
  },
  {
    description:
      "Draw attention to a card, panel, or CTA with Border Beam, a React overlay that animates a glowing gradient beam around its border. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Border Beam is a React decorative component from VLLNT UI that animates a glowing gradient beam around the border of a highlighted surface. It renders an aria-hidden overlay and does not capture pointer events.",
        question: "What is Border Beam?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/border-beam.json` to install Border Beam via the shadcn CLI. Place it inside a relatively positioned element to draw the animated border.",
        question: "How do I add Border Beam?",
      },
      {
        answer:
          "Adjust the duration and delay props to time the loop, set reverse to flip its direction, tune borderWidth, and pass colorFrom and colorTo to change the gradient. Defaults derive from the primary and ring theme colors.",
        question: "How do I customize Border Beam's animation?",
      },
    ],
    related: ["shine-border", "shimmer-button", "spotlight-card"],
    slug: "border-beam",
    title: "Border Beam — animated glowing border effect in React | VLLNT UI",
    whatItIs:
      "Border Beam is a decorative overlay that animates a glowing gradient beam traveling around an element's border. Drop it inside a relatively positioned container and it fills the border with a conic-gradient beam masked to the edge, looping continuously. Props control borderWidth, duration, delay, the from and to colors, and a reverse direction. It is aria-hidden and pointer-events-none, so use it to highlight cards, buttons, or panels without affecting interaction.",
  },
  {
    description:
      "Add a date picker calendar in React for selecting single dates or ranges. Built on react-day-picker with keyboard navigation. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Calendar is a date picker calendar component for React built on react-day-picker. It renders a month grid for selecting dates and supports single, multiple, and range selection.",
        question: "What is Calendar?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/calendar.json` to install it into your project via the shadcn CLI.",
        question: "How do I add Calendar?",
      },
      {
        answer:
          "Yes. Calendar wraps react-day-picker's DayPicker and forwards all of its props, so you can set the selection mode, disabled dates, and other options while keeping the VLLNT UI styling.",
        question: "Is Calendar built on react-day-picker?",
      },
    ],
    related: [
      "date-picker",
      "date-range-picker",
      "range-calendar",
      "date-field",
    ],
    slug: "calendar",
    title: "Calendar — date picker calendar in React | VLLNT UI",
    whatItIs:
      "Calendar is a date picker calendar for React, built on react-day-picker. It renders a month grid for selecting dates and forwards every DayPicker prop, so you can switch between single, multiple, and range selection modes. Styling matches the rest of the system, with outside days shown by default and custom chevron navigation. Use it inline or inside a popover to build date pickers, booking flows, and scheduling interfaces.",
  },
  {
    description:
      "Highlight notes, tips, and warnings in your React docs with a colored, left-bordered callout box. Six semantic variants plus icons. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Callout is a React component that renders a highlighted, left-bordered box for notes, tips, and warnings. It ships six variants — info, note, tip, success, warning, and danger — each with its own color and default title.",
        question: "What is Callout?",
      },
      {
        answer:
          'Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/callout.json` to copy the component into your project, then import and render `<Callout variant="tip">…</Callout>`.',
        question: "How do I add Callout to my app?",
      },
      {
        answer:
          'The `variant` prop accepts info, note, tip, success, warning, or danger; each applies its own border and background color and a default title you can override. The wrapper carries `role="alert"` for assistive tech.',
        question: "What severity styles does Callout support?",
      },
    ],
    related: ["card", "accordion", "faq", "code-block"],
    slug: "callout",
    title: "React Callout Component — info, tip & warning banners | VLLNT UI",
    whatItIs:
      "Callout is a small boxed component that draws attention to a piece of content — an aside, a tip, a caveat, or a hazard. It renders a left-bordered panel with a title and body, and ships six semantic variants: info, note, tip, success, warning, and danger. Each variant sets its own color and default heading, and you can override the title, pass a custom icon, or add classes. Reach for it in documentation, changelogs, and long-form pages.",
  },
  {
    description:
      "Add a pan-and-zoom canvas to your React app for diagrams, boards, and node editors. Drag to pan, use keys or the wheel to zoom. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Canvas View is a React component that provides an interactive pan-and-zoom viewport for spatial surfaces like diagrams, boards, and node editors. Content moves as one transformed layer, and it supports pointer, wheel, and keyboard navigation plus an optional overlay slot.",
        question: "What is Canvas View?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/canvas-view.json` to install it into your React project via the shadcn CLI, then import and render CanvasView around your content.",
        question: "How do I add Canvas View?",
      },
      {
        answer:
          "Users pan by holding the space bar and dragging, by using the middle mouse button, or by scrolling the wheel. They zoom with the plus and minus keys or a control/command-held wheel, and press 0 to reset the viewport. The interaction region is labeled for screen readers.",
        question: "How do users pan and zoom Canvas View?",
      },
    ],
    related: [
      "anchor-port",
      "canvas-shell",
      "infinite-plane",
      "connector-edge",
    ],
    slug: "canvas-view",
    title: "Canvas View — pan-and-zoom canvas viewport in React | VLLNT UI",
    whatItIs:
      "Canvas View is an interactive viewport for spatial surfaces — infinite boards, diagrams, mind maps, and node editors. It manages pan and zoom state so your content moves as a single transformed layer. Users pan by holding space and dragging or using the middle mouse button, and zoom with the plus and minus keys or a modifier-held wheel. It exposes viewport callbacks, an imperative reset handle, min and max zoom bounds, and an overlay slot. Reach for it whenever content outgrows its container.",
  },
  {
    description:
      "Build swipeable galleries, testimonials, or sliders with Carousel, a React component built on Embla with buttons and keyboard nav. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Carousel is a React slider component from VLLNT UI built on Embla Carousel. It scrolls through slides horizontally or vertically with previous and next buttons, keyboard navigation, and drag or touch swiping.",
        question: "What is Carousel?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/carousel.json` to install Carousel via the shadcn CLI. The compound components are copied into your project so you can compose slides freely.",
        question: "How do I add Carousel?",
      },
      {
        answer:
          "Yes. Set the orientation prop to vertical for a stacked layout, and pass Embla plugins such as autoplay plus opts and setApi to configure and control the underlying Embla instance.",
        question: "Does Carousel support vertical scrolling and plugins?",
      },
    ],
    related: ["slideshow", "animated-list", "bento-grid"],
    slug: "carousel",
    title: "Carousel — swipeable content slider in React | VLLNT UI",
    whatItIs:
      "Carousel is a scrollable slider built on Embla Carousel. Compose it from Carousel, CarouselContent, and CarouselItem, then add CarouselPrevious and CarouselNext buttons that disable automatically at the first and last slide. It supports horizontal or vertical orientation, arrow-key navigation, drag and touch swiping, and Embla plugins through the opts, plugins, and setApi props. Use it for image galleries, testimonials, onboarding steps, or product showcases.",
  },
  {
    description:
      "Track onboarding and setup tasks with Checklist, a React component with toggleable items, a live progress bar, and saved progress. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Checklist is a React component from VLLNT UI that renders a list of toggleable items with live progress tracking. It shows a completion bar, a checked count and percentage, and a message once all items are done.",
        question: "What is Checklist?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/checklist.json` to install Checklist via the shadcn CLI. The component source is copied into your project so you can adapt items, titles, and styling.",
        question: "How do I add Checklist?",
      },
      {
        answer:
          "Yes. Provide a persistKey and the checked items are saved to localStorage under that key, so progress is restored on the next visit. Toggling also dispatches a progress-change event other components can listen for.",
        question: "Does Checklist remember progress?",
      },
    ],
    related: ["quiz", "progress-tracker", "step-by-step"],
    slug: "checklist",
    title: "Checklist — trackable task list with progress in React | VLLNT UI",
    whatItIs:
      "Checklist is an interactive task list that tracks completion. Each item toggles between checked and unchecked, striking through completed labels and updating a progress bar with a count and percentage. Pass a persistKey to save progress to localStorage across visits, and an onComplete callback fires once every item is checked. Optional titles and per-item descriptions make it suited to onboarding flows, setup guides, and tutorial step tracking.",
  },
  {
    description:
      "Build a searchable command palette or ⌘K menu in React with filtering, groups, and full keyboard navigation. Built on cmdk. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Command is a command-palette component for React, built on the cmdk library. It pairs a search input with grouped, filterable result lists, items, shortcuts, and an empty state.",
        question: "What is Command?",
      },
      {
        answer:
          "Run pnpm dlx shadcn@latest add https://ui.vllnt.com/r/command.json to copy the source into your project, then import Command and its parts from your ui directory.",
        question: "How do I add Command?",
      },
      {
        answer:
          "Use the CommandDialog export, which renders the same palette inside a Radix dialog. Toggle its open prop from a keyboard shortcut to get a centered ⌘K overlay.",
        question: "How do I make Command open as a ⌘K modal?",
      },
    ],
    related: ["dialog", "popover", "dropdown-menu"],
    slug: "command",
    title: "Command — command palette with search in React | VLLNT UI",
    whatItIs:
      "Command is a command palette built on the cmdk library. It combines a search input, grouped result lists, items, shortcuts, and an empty state, filtering entries as the user types and moving the highlight with arrow keys. Use it for a searchable action menu or a ⌘K launcher that jumps between pages, runs commands, or finds records. CommandDialog wraps the same palette in a Radix dialog so it opens as a centered modal overlay.",
  },
  {
    description:
      "Build interactive data grids in React with instant column sorting, global search, faceted filters, row selection, and pagination. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Data Table is a React data grid built on TanStack Table that adds sorting, global search, column filters, row selection, and pagination on top of the base Table primitives.",
        question: "What is Data Table?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/data-table.json` to install it into your project via the shadcn CLI.",
        question: "How do I add Data Table?",
      },
      {
        answer:
          "Table is a set of unstyled markup primitives you wire up yourself, while Data Table is a ready-made component that manages sorting, filtering, selection, and pagination state internally from column and data props.",
        question: "How is Data Table different from Table?",
      },
    ],
    related: ["table", "data-list", "watchlist"],
    slug: "data-table",
    title: "Data Table — sorting, filtering & pagination in React | VLLNT UI",
    whatItIs:
      "Data Table is a batteries-included React table built on TanStack Table. Reach for it when a plain table is not enough and you need sorting, a global search box, per-column faceted filters, row selection with checkboxes, and client-side pagination out of the box. You pass column definitions and data; it manages sorting, filter, selection, and page state internally. Toggles let you turn filtering, pagination, or selection off per instance.",
  },
  {
    description:
      "Add an accessible dropdown menu in React with items, checkboxes, radio groups, and submenus. Built on Radix UI keyboard nav. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Dropdown Menu is an accessible menu component for React that opens from a trigger button. Built on Radix UI, it supports items, checkbox items, radio groups, submenus, labels, separators, and shortcuts.",
        question: "What is Dropdown Menu?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/dropdown-menu.json` to install it into your project via the shadcn CLI.",
        question: "How do I add Dropdown Menu?",
      },
      {
        answer:
          "Yes. It is built on Radix UI's dropdown-menu primitive, which handles keyboard navigation, typeahead, focus management, and ARIA roles, including nested submenus and checkbox and radio items.",
        question: "Is Dropdown Menu keyboard accessible?",
      },
    ],
    related: ["context-menu", "popover", "command", "dialog"],
    slug: "dropdown-menu",
    title: "Dropdown Menu — accessible menu with submenus in React | VLLNT UI",
    whatItIs:
      "Dropdown Menu is an accessible menu triggered by a button, built on Radix UI's dropdown-menu primitive. It supports plain items, checkbox items, radio groups, nested submenus, labels, separators, and keyboard shortcuts, with optional inset spacing for alignment. Use it for action menus, account switchers, and command surfaces where users pick an option. Radix provides keyboard navigation, typeahead, focus management, and correct ARIA roles out of the box.",
  },
  {
    description:
      "Label the link between two nodes in a React graph or flow with an uppercase pill. Two emphasis levels for streams or handoffs. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Edge Label is a React component that renders a small uppercase pill used to label the relationship on a graph edge or flow connector, such as a stream, handoff, or policy.",
        question: "What is Edge Label?",
      },
      {
        answer:
          'Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/edge-label.json`, then render `<EdgeLabel emphasis="active">stream</EdgeLabel>` and position it over your edge.',
        question: "How do I add Edge Label to my app?",
      },
      {
        answer:
          "Two, via the `emphasis` prop: `subtle` (the default) renders a muted, bordered label, and `active` renders a highlighted sky-colored label. The chosen value is also exposed as a `data-emphasis` attribute for styling.",
        question: "What emphasis styles does Edge Label support?",
      },
    ],
    related: ["tooltip", "animated-tooltip", "hover-card", "zoom-hud"],
    slug: "edge-label",
    title: "React Edge Label — pill label for graph edges & flows | VLLNT UI",
    whatItIs:
      "Edge Label is a small pill-shaped tag for annotating the connection between two nodes — the kind of label you place on an edge in a graph, flow, or pipeline to name a stream, handoff, or policy. It renders as an inline, uppercase, letter-spaced badge and takes an emphasis prop with two levels: subtle for muted resting labels and active for a highlighted sky-toned state. It forwards every native span prop for positioning.",
  },
  {
    description:
      "Build accessible, validated React forms with labels, descriptions, and inline error messages. Powered by React Hook Form and Zod. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Form is an accessible, composable form wrapper for React. It pairs Label, control, description, and message parts with React Hook Form so each field validates and reports errors with the correct ARIA wiring.",
        question: "What is Form?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/form.json` to install it into your project via the shadcn CLI.",
        question: "How do I add Form?",
      },
      {
        answer:
          'Yes. It integrates React Hook Form and Zod through zodResolver for schema validation, and automatically wires aria-describedby, aria-invalid, aria-required, and role="alert" on error messages.',
        question: "Does Form handle validation and accessibility?",
      },
    ],
    related: ["field", "select", "combobox", "calendar"],
    slug: "form",
    title:
      "Form — React Hook Form + Zod validation wrapper in React | VLLNT UI",
    whatItIs:
      'Form is a composable validation wrapper for React built on React Hook Form. It groups a label, control, description, and error message into accessible field units, automatically wiring aria-describedby, aria-invalid, and aria-required and marking error messages with role="alert". Pass a Zod schema for managed validation, or hand it your own useForm instance. Use it whenever you need labelled, validated inputs with consistent error handling across sign-up, settings, or checkout forms.',
  },
  {
    description:
      "Plan projects in React with a dependency-free Gantt chart: task bars, milestones, and a today line across day to quarter scales. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Gantt Chart is a dependency-free React component that renders project timelines as task bars with progress overlays, milestone markers, and a today line across day, week, month, or quarter scales.",
        question: "What is Gantt Chart?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/gantt-chart.json` to install it into your project via the shadcn CLI.",
        question: "How do I add Gantt Chart?",
      },
      {
        answer:
          "No. Drag-to-edit, dependency arrows, critical-path highlighting, and virtualization are intentionally out of scope; you supply and update task data through the groups prop and drive those behaviors yourself.",
        question: "Does Gantt Chart support drag-to-edit or dependency arrows?",
      },
    ],
    related: ["run-timeline", "countdown-timer", "activity-log"],
    slug: "gantt-chart",
    title: "Gantt Chart — project timeline with task bars in React | VLLNT UI",
    whatItIs:
      "Gantt Chart is a dependency-free, SVG-free React component for project planning. Reach for it to visualize scheduled work as horizontal task bars grouped into phases, with optional progress overlays, milestone diamonds, and a today indicator across day, week, month, or quarter scales. The left column lists group and task names; the right renders the timeline. Drag-to-edit, dependency arrows, and critical-path highlighting are out of scope — you drive data through the groups prop.",
  },
  {
    description:
      "Show a rich preview card when users hover a link or name in React. Accessible Radix Hover Card with configurable align and offset. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Hover Card is a React component, built on Radix UI's Hover Card primitive, that shows a floating card of rich content when a pointer hovers its trigger.",
        question: "What is Hover Card?",
      },
      {
        answer:
          "Run pnpm dlx shadcn@latest add https://ui.vllnt.com/r/hover-card.json to copy the source into your project, then import HoverCard, HoverCardTrigger, and HoverCardContent.",
        question: "How do I add Hover Card?",
      },
      {
        answer:
          "A tooltip shows short text on hover or focus; Hover Card renders a full bordered card with layout and media, opens on hover or focus with configurable delays, and suits previews like profiles.",
        question: "How is Hover Card different from a tooltip?",
      },
    ],
    related: ["tooltip", "popover", "animated-tooltip"],
    slug: "hover-card",
    title: "Hover Card — rich hover preview popover in React | VLLNT UI",
    whatItIs:
      "Hover Card is a popover built on Radix UI's Hover Card primitive that reveals extra content when a pointer hovers a trigger. Compose it from HoverCard, HoverCardTrigger, and HoverCardContent, which renders a bordered card with configurable align and side offset. Use it to preview linked content — a user profile, a repository, or a footnote — without a click or navigation. Unlike a tooltip, it holds rich layout and media and opens on hover or focus of its trigger.",
  },
  {
    description:
      "Show remote users' cursors on a shared canvas in your React app, positioned by x/y with a name and status chip. Pointer-events safe. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Live Cursor is a React component that draws another user's cursor at given canvas coordinates, with an optional name and status chip. It is presentation-only — you supply the position, color, and name from your realtime layer.",
        question: "What is Live Cursor?",
      },
      {
        answer:
          'Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/live-cursor.json`, then render `<LiveCursor x={x} y={y} name="Bea" color="#5b8def" />` inside a positioned container.',
        question: "How do I add Live Cursor to my app?",
      },
      {
        answer:
          'No. The cursor wrapper uses pointer-events none, so gestures pass through to the canvas. It also sets `role="img"` with an aria-label derived from the user\'s name for screen readers.',
        question: "Does Live Cursor block clicks on the canvas underneath?",
      },
    ],
    related: ["cursor", "comment-pin", "selection-presence", "thread-bubble"],
    slug: "live-cursor",
    title:
      "React Live Cursor — multiplayer presence cursor component | VLLNT UI",
    whatItIs:
      "Live Cursor renders a remote user's pointer on a shared canvas or document, positioned by x and y pixel coordinates, with an optional name-and-status chip beside it. It is pure presentation: your app owns the realtime stream and maps each user to a color, then feeds coordinates in. The wrapper is pointer-events none, so it never blocks the interactions underneath. Use it to build multiplayer cursors for collaborative editors, whiteboards, and design tools.",
  },
  {
    description:
      "Scroll logos, badges, or testimonials in a seamless infinite loop in a React app. Pause-on-hover, vertical mode, and speed presets. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Marquee is a React component that scrolls its children in an infinite, seamless loop. It is commonly used for logo clouds, badge rows, and scrolling testimonials or status chips.",
        question: "What is Marquee?",
      },
      {
        answer:
          'Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/marquee.json`, then wrap your items: `<Marquee pauseOnHover speed="slow">…</Marquee>`.',
        question: "How do I add Marquee to my app?",
      },
      {
        answer:
          "Yes. Set `pauseOnHover` to stop the scroll while hovered, and Marquee honors `prefers-reduced-motion` by disabling the animation. You can also set `vertical` or `reverse` for direction, and `speed` or `duration` for pace.",
        question: "Can Marquee pause on hover and respect reduced motion?",
      },
    ],
    related: ["animated-text", "number-ticker", "border-beam", "meteors"],
    slug: "marquee",
    title: "React Marquee Component — infinite scrolling logo lane | VLLNT UI",
    whatItIs:
      "Marquee is a utility that scrolls its children in a continuous, seamless loop — ideal for logo walls, badge rows, testimonials, or status chips. It duplicates the track so the animation never shows a gap, and supports horizontal or vertical direction, reverse, an adjustable gap, a repeat count, and three speed presets (slow, normal, fast) or an explicit duration. Edge fade and pause-on-hover are optional, and it respects prefers-reduced-motion by halting the animation.",
  },
  {
    description:
      "Add knowledge checks to lessons and docs with Quiz, a React multiple-choice component with hints, explanations, and scoring. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Quiz is a React multiple-choice component from VLLNT UI that presents one question with several options. It validates the selected answer, highlights correct and incorrect choices, and can display hints and explanations for self-paced learning.",
        question: "What is Quiz?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/quiz.json` to install Quiz via the shadcn CLI. The component and its types are copied into your project so you can customize them.",
        question: "How do I add Quiz?",
      },
      {
        answer:
          "Yes. Pass a hint string to reveal a Show hint toggle, give any option an explanation shown after submitting, and pass an explanation node for the result panel. An onAnswer callback fires with whether the choice was correct.",
        question: "Does Quiz show hints and explanations?",
      },
    ],
    related: ["flashcard", "exercise", "checklist"],
    slug: "quiz",
    title: "Quiz — interactive multiple-choice question in React | VLLNT UI",
    whatItIs:
      "Quiz is an interactive multiple-choice component for a single question. Learners pick one option and press Check Answer; the component marks the choice correct or incorrect, reveals the right option, and can show a per-option explanation plus an overall result panel. An optional hint toggle and a Try Again reset are built in, and an onAnswer callback reports whether the answer was right. Use it to embed knowledge checks in tutorials, docs, or courseware.",
  },
  {
    description:
      "Add Cmd+K command-palette search to your app with Search Dialog, a React component with keyboard shortcuts and match highlighting. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Search Dialog is a React command-palette component from VLLNT UI. It opens a modal search over a list of items, highlights matches, and supports optional asynchronous documentation search across scoped tabs.",
        question: "What is Search Dialog?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/search-dialog.json` to install Search Dialog via the shadcn CLI. The component and its types are copied into your project so you can wire it to your data.",
        question: "How do I add Search Dialog?",
      },
      {
        answer:
          "Yes. It listens for Cmd+K (or Ctrl+K) to toggle open and shows a shortcut badge on the trigger button. The shortcut is ignored while typing in inputs, and you can turn it off with the enableKeyboardShortcut prop.",
        question: "Does Search Dialog support a keyboard shortcut?",
      },
    ],
    related: ["keyboard-shortcuts-help", "tutorial-filters", "tour"],
    slug: "search-dialog",
    title: "Search Dialog — Cmd+K command palette search in React | VLLNT UI",
    whatItIs:
      "Search Dialog is a command-palette search built on the Command component. A trigger button and a Cmd/Ctrl+K shortcut open a modal where users type to filter items, with matching text highlighted and results sorted by title. Supply an async docsSearch function to enable Components, Docs, and Everything scope tabs with loading and empty states, and onSelect callbacks handle navigation. Use it for site-wide search, docs lookup, or in-app navigation.",
  },
  {
    description:
      "Switch between views, modes, or filters with Segmented Control, a React single-select toggle built on Radix with size variants. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Segmented Control is a React single-select component from VLLNT UI, built on Radix Toggle Group. It groups related options into one control so users pick exactly one, ideal for toggling views, modes, or filters.",
        question: "What is Segmented Control?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/segmented-control.json` to install Segmented Control via the shadcn CLI. The component source is copied into your project so you can restyle the segments.",
        question: "How do I add Segmented Control?",
      },
      {
        answer:
          "Both. Use value with onValueChange for a controlled component, or defaultValue for uncontrolled state. It allows only a single active option and offers sm, default, and lg size variants.",
        question: "Is Segmented Control controlled or uncontrolled?",
      },
    ],
    related: ["button-group", "select", "multi-select"],
    slug: "segmented-control",
    title:
      "Segmented Control — single-choice mode switcher in React | VLLNT UI",
    whatItIs:
      "Segmented Control is a single-choice selector that lets users switch between a small set of options, such as modes, views, or filters. Built on Radix Toggle Group, it renders a SegmentedControl with SegmentedControlItem children, exposes value, defaultValue, and onValueChange for controlled or uncontrolled use, and supports sm, default, and lg sizes. The active segment is highlighted, individual items can be disabled, and keyboard focus is handled for you.",
  },
  {
    description:
      "Let users pick one option from a dropdown in React forms. Accessible Radix Select with keyboard typeahead, groups, and scrolling. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Select is an accessible dropdown input for React, built on Radix UI's Select primitive. It lets users choose one value from a list and is composed of Select, SelectTrigger, SelectContent, and SelectItem parts.",
        question: "What is Select?",
      },
      {
        answer:
          "Run pnpm dlx shadcn@latest add https://ui.vllnt.com/r/select.json to copy the source into your project, then import the Select parts from your ui directory.",
        question: "How do I add Select?",
      },
      {
        answer:
          "Yes. Because it wraps Radix UI's Select primitive, it supports full keyboard navigation, typeahead to jump to options, and correct listbox ARIA roles out of the box.",
        question: "Is Select keyboard accessible?",
      },
    ],
    related: ["native-select", "combobox", "multi-select"],
    slug: "select",
    title: "Select — accessible dropdown select input in React | VLLNT UI",
    whatItIs:
      "Select is a dropdown input built on Radix UI's Select primitive for choosing a single value from a list. Click the trigger to open a portal-rendered menu with keyboard navigation, typeahead, grouped options, labels, separators, and scroll buttons for long lists. Use it in forms when the option set is known and you want a styled, accessible alternative to the native select element. It is composed from Select, SelectTrigger, SelectContent, and SelectItem parts.",
  },
  {
    description:
      "Slide a panel in from any screen edge for navigation, forms, or details in React. Built on Radix Dialog with four side options. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Sheet is a slide-over panel component for React that animates in from a screen edge. It is built on Radix UI Dialog and includes trigger, content, header, footer, title, description, and close parts.",
        question: "What is Sheet?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/sheet.json` to install it into your project via the shadcn CLI.",
        question: "How do I add Sheet?",
      },
      {
        answer:
          "The side prop accepts top, right (the default), bottom, or left, so the panel slides in from whichever edge you choose. Built on Radix Dialog, it also traps focus and closes on Escape.",
        question: "Which sides can a Sheet open from?",
      },
    ],
    related: ["dialog", "drawer", "popover", "alert-dialog"],
    slug: "sheet",
    title: "Sheet — slide-over panel from the screen edge in React | VLLNT UI",
    whatItIs:
      "Sheet is a slide-over panel that enters from the edge of the screen, built on Radix UI's Dialog primitive. A side variant positions it on the top, right, bottom, or left, and it ships with trigger, content, header, footer, title, description, and close parts. Use it for navigation drawers, filters, quick forms, or detail views that shouldn't take over the whole page. Radix handles focus trapping, escape-to-close, and ARIA.",
  },
  {
    description:
      "Compose accessible tables in React from header, body, footer, row, and cell primitives — styled semantic markup you fully control. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Table is a collection of composable React primitives — Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, and TableCaption — for building styled, semantic HTML tables.",
        question: "What is Table?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/table.json` to install it into your project via the shadcn CLI.",
        question: "How do I add Table?",
      },
      {
        answer:
          "No. Table only renders the styled markup and a scrollable container; for built-in sorting, filtering, selection, and pagination use the Data Table component instead.",
        question: "Does Table include sorting or pagination?",
      },
    ],
    related: ["data-table", "data-list", "watchlist"],
    slug: "table",
    title: "Table — styled semantic HTML table primitives in React | VLLNT UI",
    whatItIs:
      "Table is a set of unstyled, composable primitives — Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, and TableCaption — that render semantic HTML table markup with consistent styling. Reach for it when you want full control over rows and cells and only need the visual layer, not built-in sorting or pagination. It wraps the table in a horizontally scrollable container and adds hover and selected-row styles you compose yourself.",
  },
  {
    description:
      "Scrub through playback in React using a range slider built on a native input, with milestone ticks, tone variants, and value labels. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Timeline Scrubber is a controlled React range slider for scrubbing through playback, rendering a track with a value cursor and optional milestone ticks.",
        question: "What is Timeline Scrubber?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/timeline-scrubber.json` to install it into your project via the shadcn CLI.",
        question: "How do I add Timeline Scrubber?",
      },
      {
        answer:
          "Yes. It is built on a native input type=range, so keyboard navigation, pointer input, and screen-reader semantics work out of the box.",
        question: "Is Timeline Scrubber keyboard accessible?",
      },
    ],
    related: ["time-field", "date-range-picker", "number-input"],
    slug: "timeline-scrubber",
    title: "Timeline Scrubber — range slider for playback in React | VLLNT UI",
    whatItIs:
      "Timeline Scrubber is a controlled range slider for scrubbing through canvas or video-style playback in React. Reach for it when you need a thin timeline track with a draggable handle, optional milestone ticks, tone variants, and formatted value labels. It builds on a native input type=range, so keyboard, pointer, and screen-reader support come for free. The host owns the value and drives the playback loop; the component is pure presentation.",
  },
  {
    description:
      "Two-state toggle button for React UIs: bold, italic, or grid vs list view. Accessible Radix primitive with variants and sizes. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Toggle is a two-state button component for React, built on Radix UI's Toggle primitive. It switches a single option on or off and reflects the pressed state via data-[state=on] styling.",
        question: "What is Toggle?",
      },
      {
        answer:
          "Run pnpm dlx shadcn@latest add https://ui.vllnt.com/r/toggle.json to copy the source into your project, then import Toggle from your ui directory.",
        question: "How do I add Toggle?",
      },
      {
        answer:
          "Toggle ships default and outline variants and three sizes — sm, default, and lg — all configured through the toggleVariants CVA helper and overridable with className.",
        question: "What variants and sizes does Toggle support?",
      },
    ],
    related: ["toggle-group", "switch", "button"],
    slug: "toggle",
    title: "Toggle — accessible two-state toggle button in React | VLLNT UI",
    whatItIs:
      "Toggle is a two-state button built on Radix UI's Toggle primitive. It flips between on and off, exposing the pressed state through data-[state=on] styling so you can theme it with Tailwind. Reach for it when a single control switches one option on or off — bold text, grid versus list view, or mute audio. It ships with default and outline variants plus small, default, and large sizes. For a set of related toggles, use Toggle Group instead.",
  },
  {
    description:
      "Give React canvas users a saved-view list to jump between pinned pan and zoom locations. Shows active, empty, and read-only states. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Viewport Bookmarks is a React component that renders a saved-view list for a canvas — the spatial parallel of pinned tabs. Each row names a stored pan and zoom target, with an optional accent color, detail line, and active state.",
        question: "What is Viewport Bookmarks?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/viewport-bookmarks.json` to install it into your React project via the shadcn CLI, then pass your bookmarks array to the ViewportBookmarks component.",
        question: "How do I add Viewport Bookmarks?",
      },
      {
        answer:
          'Yes. When you provide an onSelect handler each row renders as a clickable button; omit it and the rows render as read-only text. It also includes a built-in empty state ("No saved views") and localizable region and empty labels.',
        question: "Can Viewport Bookmarks be read-only?",
      },
    ],
    related: [
      "workspace-switcher",
      "view-switcher",
      "world-breadcrumbs",
      "tabs",
    ],
    slug: "viewport-bookmarks",
    title:
      "Viewport Bookmarks — saved-view list for canvases in React | VLLNT UI",
    whatItIs:
      "Viewport Bookmarks is a saved-view list for a canvas — the spatial parallel of pinned tabs. Each entry names a stored pan and zoom target, with an optional accent color and a secondary detail line. Rows render as buttons when you pass an onSelect handler, or as read-only text when you do not, and an active id highlights the current view. It ships with an empty state and localizable labels. It is pure presentation; your app owns the bookmark store and the camera animation.",
  },
  {
    description:
      "Let users switch between workspaces or contexts with a segmented, radio-group pill control in React. Controlled or uncontrolled. Install via the shadcn CLI.",
    faqs: [
      {
        answer:
          "Workspace Switcher is a React component that renders a segmented pill control for switching between workspaces, canvas views, or operational contexts. Options are supplied as an array of id and label pairs, and the active one is visually highlighted.",
        question: "What is Workspace Switcher?",
      },
      {
        answer:
          "Run `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/workspace-switcher.json` to install it into your React project via the shadcn CLI, then pass your workspaces array to the WorkspaceSwitcher component.",
        question: "How do I add Workspace Switcher?",
      },
      {
        answer:
          "It works both ways. Pass value with onValueChange for a controlled component, or defaultValue to let it manage its own selection. It renders as an accessible radio group, marking the selected workspace with aria-checked.",
        question: "Is Workspace Switcher controlled or uncontrolled?",
      },
    ],
    related: ["view-switcher", "viewport-bookmarks", "tabs", "animated-tabs"],
    slug: "workspace-switcher",
    title:
      "Workspace Switcher — segmented workspace picker in React | VLLNT UI",
    whatItIs:
      "Workspace Switcher is a compact, segmented control for moving between workspaces, canvas views, or operational contexts. It renders each option as a pill inside a radio group, highlighting the active one, and works either controlled or uncontrolled through value and defaultValue props. An onValueChange callback reports selection, and each option can carry a description shown as a tooltip and, on wider screens, inline. Reach for it when users toggle between a handful of top-level contexts rather than navigating a deep menu.",
  },
];

/** Resolve hand-written SEO copy for a slug, if any. */
export function getComponentSeo(slug: string): ComponentSeo | undefined {
  return COMPONENT_SEO.find((entry) => entry.slug === slug);
}
