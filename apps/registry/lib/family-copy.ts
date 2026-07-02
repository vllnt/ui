import type { ComponentCategory } from "@/types/registry";

/**
 * Editorial copy for a component family landing page — an SEO-oriented intro and
 * a short FAQ. Families without an entry fall back to the one-line
 * `getCategoryDescription`. The `ai` family has its own curated page at `/ai`,
 * so this map skips it.
 */
export type FamilyCopy = {
  readonly category: ComponentCategory;
  readonly faq: readonly {
    readonly answer: string;
    readonly question: string;
  }[];
  readonly intro: string;
};

const FAMILY_COPY: readonly FamilyCopy[] = [
  {
    category: "core",
    faq: [
      {
        answer:
          "The foundational, unopinionated primitives — Button, Input, Label, Switch, Badge, Kbd, Separator, and the layout atoms — that every other component composes from.",
        question: "What counts as a core component?",
      },
      {
        answer:
          "No. Every @vllnt/ui component installs independently with the shadcn CLI — add only the ones you use.",
        question: "Do I have to install all of them?",
      },
    ],
    intro:
      "Core components are the primitives every interface is built from — buttons, inputs, labels, switches, badges, and the layout atoms underneath them. They're unopinionated, accessible, and the foundation the rest of the library composes on.",
  },
  {
    category: "form",
    faq: [
      {
        answer:
          "Text, search, and phone fields, selects and comboboxes, checkboxes and radio groups, date/time/range pickers, ratings, OTP inputs, and validation wrappers.",
        question: "What input types are covered?",
      },
      {
        answer:
          "Yes. Inputs are accessible by default and integrate with react-hook-form via the Form components; they work controlled or uncontrolled.",
        question: "Are the form components accessible and validated?",
      },
    ],
    intro:
      "Form components cover the full input surface — text and search fields, selects, checkboxes, date and time pickers, ratings, and validation — so you can assemble accessible, controlled forms without wiring primitives by hand.",
  },
  {
    category: "overlay",
    faq: [
      {
        answer:
          "Dialogs and alert dialogs, sheets and drawers, popovers, hover cards, tooltips, and toasts — content that layers above the page.",
        question: "What's in the overlay family?",
      },
    ],
    intro:
      "Overlay components layer content above the page — dialogs, sheets, drawers, popovers, tooltips, and toasts. Focus management and dismissal are handled for you, built on accessible Radix primitives.",
  },
  {
    category: "navigation",
    faq: [
      {
        answer:
          "Menus and menubars, breadcrumbs, tabs, pagination, command palettes, docks and rails, and floating navbars — everything for moving through an app.",
        question: "What's in the navigation family?",
      },
    ],
    intro:
      "Navigation components move people through an app — menus, breadcrumbs, tabs, pagination, docks, rails, and floating navbars. Keyboard-accessible and composable into any shell.",
  },
  {
    category: "data",
    faq: [
      {
        answer:
          "Tables and data tables, lists, charts, metrics, gauges, status boards, and activity feeds — the surfaces that read, filter, and summarize records.",
        question: "What's in the data family?",
      },
    ],
    intro:
      "Data components turn records into something readable — sortable tables, lists, charts, metrics, gauges, and live status boards. Feed them your data and they handle filtering, formatting, and layout.",
  },
  {
    category: "data-display",
    faq: [
      {
        answer:
          "Visualization-first components — maps, globes, choropleths, heatmaps, timelines, and specialized charts — that render spatial or temporal data.",
        question: "How is data-display different from data?",
      },
    ],
    intro:
      "Data-display components visualize spatial and temporal data — 2D maps, 3D globes, choropleths, heatmaps, route maps, and timelines. They render from plain data props, no map tiles or external services required.",
  },
  {
    category: "content",
    faq: [
      {
        answer:
          "Layout and presentation components — bento grids, cards, testimonials, marquees, expandable panels, timelines, and text-reveal effects — for marketing and editorial surfaces.",
        question: "What's in the content family?",
      },
    ],
    intro:
      "Content components lay out and animate information — bento grids, cards, testimonials, timelines, expandable panels, and text effects. Use them to build landing pages, docs, and editorial surfaces that stay on the design system.",
  },
  {
    category: "learning",
    faq: [
      {
        answer:
          "Tutorials and curricula, lessons and flashcards, quizzes and exercises, steppers, progress trackers, and guided tours — the scaffolding for learning products.",
        question: "What's in the learning family?",
      },
    ],
    intro:
      "Learning components structure guided experiences — curricula, tutorials, flashcards, quizzes, steppers, progress trackers, and tours. Compose them into onboarding flows, courses, and interactive docs.",
  },
  {
    category: "educational",
    faq: [
      {
        answer:
          "Knowledge-check runners, comparison and figure cards, and era/parallel timelines — components for teaching and reference products.",
        question: "What's in the educational family?",
      },
    ],
    intro:
      "Educational components support teaching and reference experiences — knowledge checks, historical figure and civilization cards, era comparisons, and parallel timelines. Built for courseware, wikis, and study tools.",
  },
  {
    category: "billing",
    faq: [
      {
        answer:
          "Pricing tables, plan cards, subscription and wallet cards, credit badges, and transaction lists — the surfaces that show cost, usage, and renewal state.",
        question: "What's in the billing family?",
      },
      {
        answer:
          "No. These are presentational React components — wire them to Stripe, Polar, or your own billing API. They render state; they don't process payments.",
        question: "Do these components handle payments?",
      },
    ],
    intro:
      "Billing components render the money side of a product — pricing tables, plan and subscription cards, credit badges, wallets, and transaction history. Drop them in and connect your billing provider; they present cost, usage, and renewal state without prescribing a backend.",
  },
  {
    category: "utility",
    faq: [
      {
        answer:
          "Indicators and helpers — spinners, skeletons, copy buttons, QR codes — plus visual effects like glass surfaces, particles, shimmer, and magnetic interactions.",
        question: "What's in the utility family?",
      },
    ],
    intro:
      "Utility components are the helpers and effects that finish an interface — spinners, skeletons, copy buttons, QR codes, and visual flourishes like glass, particles, and shimmer. Small pieces that glue the rest together.",
  },
];

/**
 * Editorial copy for a family landing page, or `undefined` when the family has
 * no dedicated copy (the page falls back to the one-line description).
 *
 * @param category - the component category
 */
export function getFamilyCopy(
  category: ComponentCategory,
): FamilyCopy | undefined {
  return FAMILY_COPY.find((entry) => entry.category === category);
}
