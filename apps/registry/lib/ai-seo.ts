import { registry } from "@/lib/registry";

/**
 * Single source of truth for the "UI for AI agents" SEO positioning.
 *
 * Two surfaces consume this:
 * 1. The component page (`/components/[slug]`) — overrides the document title +
 *    meta description for AI components and renders a "When to use in an AI app"
 *    block, so both Google and answer engines understand the use-case.
 * 2. The AI category hub (`/ai`) — groups the AI component family by
 *    job-to-be-done and links to every member, concentrating internal-link
 *    equity on the wedge.
 *
 * Keep SEO copy here, not in the generated `component-metadata.json` (that file
 * is rebuilt by `registry:build` and would overwrite hand-written copy).
 */

export type AiComponentSeo = {
  /** Meta description (~150–160 chars), use-case first. */
  readonly description: string;
  /** Registry slug this copy belongs to. */
  readonly slug: string;
  /** Full <title> including the brand suffix — used verbatim. */
  readonly title: string;
  /** Prose rendered as "When to use this in an AI app" on the component page. */
  readonly whenToUse: string;
};

/**
 * Per-component SEO copy for the core AI-agent components. Slugs not present here
 * fall back to the registry title/description and render no use-case block.
 */
export const AI_SEO: readonly AiComponentSeo[] = [
  {
    description:
      "Visualize an AI agent's execution chain in React — steps, tools, decisions, and progress. The activity timeline for agentic apps. Install via the shadcn CLI.",
    slug: "agent-activity",
    title: "Agent Activity — visualize an AI agent's steps in React | VLLNT UI",
    whenToUse:
      "Reach for Agent Activity to show a multi-step agent run as it happens — each step, tool, and decision in sequence. It fits autonomous or long-running agent workflows where users need to follow progress in real time.",
  },
  {
    description:
      "Rendered output panel for AI-generated content in React: toolbar with copy, edit, download, fullscreen, and version chips. The artifacts/canvas UI. Install via the shadcn CLI.",
    slug: "ai-artifact",
    title:
      "AI Artifact — render AI-generated output (canvas) in React | VLLNT UI",
    whenToUse:
      "Use AI Artifact for substantial generated output — code, documents, designs — that deserves its own panel beside the chat. The built-in toolbar and version chips mirror the artifacts / canvas pattern users now expect from AI products.",
  },
  {
    description:
      "React prompt composer for AI chat and agents: attachments, auto-expand, toolbar actions, and submit/streaming states. Accessible, install via the shadcn CLI.",
    slug: "ai-chat-input",
    title: "AI Chat Input — React prompt composer for AI chat apps | VLLNT UI",
    whenToUse:
      "AI Chat Input is the message composer at the bottom of any chat or agent surface. It handles multi-line growth, attachments, and submit/streaming states, so you can wire it straight to your model or agent runtime.",
  },
  {
    description:
      "Render assistant, user, tool, and system messages in React. Markdown-ready chat bubbles for LLM and agent apps. Accessible, install via the shadcn CLI.",
    slug: "ai-message-bubble",
    title:
      "AI Message Bubble — chat message UI for LLM apps in React | VLLNT UI",
    whenToUse:
      "Use AI Message Bubble to render each turn in a conversation. Role variants (user, assistant, tool, system) keep an LLM transcript readable and consistent with the rest of your design system.",
  },
  {
    description:
      "Drop an AI assistant into any app: a slide-out React panel with header, content, and footer slots plus a standalone trigger. Install via the shadcn CLI.",
    slug: "ai-sidebar",
    title: "AI Sidebar — slide-out AI assistant panel for React | VLLNT UI",
    whenToUse:
      "Add AI Sidebar when you want a co-pilot alongside an existing product UI rather than a full-page chat. The provider + trigger pattern lets any screen open the assistant in context.",
  },
  {
    description:
      "Display sources and citations for RAG answers in React: title, origin label, and excerpt. Make AI answers verifiable. Accessible, install via the shadcn CLI.",
    slug: "ai-source-citation",
    title:
      "AI Source Citation — RAG sources & citations UI for React | VLLNT UI",
    whenToUse:
      "Use AI Source Citation to attribute RAG or grounded answers to their sources. Compact reference cards let users verify where an AI response came from — essential for trustworthy retrieval-augmented apps.",
  },
  {
    description:
      "Render streaming LLM output in React with a live cursor as tokens arrive. The generative-UI text primitive for AI apps. Install via the shadcn CLI.",
    slug: "ai-streaming-text",
    title:
      "AI Streaming Text — token streaming UI for LLM output in React | VLLNT UI",
    whenToUse:
      "Use AI Streaming Text for any partial assistant output that arrives token-by-token. The live cursor signals 'still generating' and keeps long responses readable as they stream in.",
  },
  {
    description:
      "Render an AI agent's tool/function calls in React: name, serialized input, status, and returned output. Built for agentic apps. Install via the shadcn CLI.",
    slug: "ai-tool-call-display",
    title: "AI Tool Call Display — render agent tool calls in React | VLLNT UI",
    whenToUse:
      "Use AI Tool Call Display whenever an agent invokes tools or functions. It surfaces the call name, arguments, status, and result so users can follow exactly what the agent did.",
  },
  {
    description:
      "Signal the end of an AI task or workflow in React with a completion dialog covering loading, error, and success states. Install via the shadcn CLI.",
    slug: "completion-dialog",
    title: "Completion Dialog — AI task completion UI for React | VLLNT UI",
    whenToUse:
      "Use Completion Dialog to close out an agent task or multi-step workflow with a clear success or error summary, so users know the run finished and what happened.",
  },
  {
    description:
      "Compare AI model responses side by side in React: optional blind mode, metadata stats, and a vote bar. Evaluate LLMs in your UI. Install via the shadcn CLI.",
    slug: "model-comparison",
    title:
      "Model Comparison — compare LLM responses side by side in React | VLLNT UI",
    whenToUse:
      "Use Model Comparison to evaluate two model responses head-to-head. Blind mode and a vote bar make it suitable for human-preference and eval workflows.",
  },
  {
    description:
      "Searchable prompt template gallery in React: category filter, variable fill-in form, and onSelect. Ship a reusable prompt library. Install via the shadcn CLI.",
    slug: "prompt-templates",
    title:
      "Prompt Templates — prompt library UI for AI apps in React | VLLNT UI",
    whenToUse:
      "Use Prompt Templates to give users a curated, fillable prompt library instead of a blank box. Variable fields turn a saved prompt into a quick form.",
  },
  {
    description:
      "Collapsible React block that streams an AI's thinking/reasoning steps. Surface chain-of-thought without cluttering the final answer. Install via the shadcn CLI.",
    slug: "thinking-block",
    title:
      "Thinking Block — show AI reasoning / chain-of-thought in React | VLLNT UI",
    whenToUse:
      "Use Thinking Block to reveal an agent's reasoning or scratchpad separately from its final answer. Collapsible plus streaming support keeps the transcript clean while staying transparent.",
  },
];

export type AiComponentGroup = {
  readonly blurb: string;
  readonly heading: string;
  readonly slugs: readonly string[];
};

/**
 * The AI component family grouped by job-to-be-done. Drives the `/ai` hub and
 * the internal-linking structure that concentrates equity on AI components.
 */
export const AI_COMPONENT_GROUPS: readonly AiComponentGroup[] = [
  {
    blurb:
      "The conversation surface — compose prompts, render turns, and embed an assistant anywhere.",
    heading: "Chat & assistant",
    slugs: ["ai-chat-input", "ai-message-bubble", "ai-sidebar"],
  },
  {
    blurb:
      "Show output as it generates and make an agent's thinking transparent.",
    heading: "Streaming & reasoning",
    slugs: ["ai-streaming-text", "thinking-block"],
  },
  {
    blurb:
      "Render what an agent is doing — tool calls, function results, and multi-step runs.",
    heading: "Tools & agent actions",
    slugs: ["ai-tool-call-display", "agent-activity"],
  },
  {
    blurb: "Attribute RAG answers so users can verify where they came from.",
    heading: "Sources & grounding",
    slugs: ["ai-source-citation"],
  },
  {
    blurb:
      "Give substantial generated content its own panel, and close out completed tasks.",
    heading: "Artifacts & output",
    slugs: ["ai-artifact", "completion-dialog"],
  },
  {
    blurb: "Ship a reusable prompt library and compare models head-to-head.",
    heading: "Prompts & evaluation",
    slugs: ["prompt-templates", "model-comparison"],
  },
  {
    blurb:
      "Shared, multiplayer surfaces for products where humans and agents work side by side.",
    heading: "Collaboration for AI-first teams",
    slugs: ["workspace-switcher", "live-cursor", "canvas-shell"],
  },
];

const ITEMS = registry.items;

export type ResolvedAiComponent = {
  readonly description: string;
  readonly name: string;
  readonly title: string;
};

export function getAiSeo(slug: string): AiComponentSeo | undefined {
  return AI_SEO.find((entry) => entry.slug === slug);
}

/** Resolve a slug to display title + description (override description wins). */
export function resolveAiComponent(
  slug: string,
): ResolvedAiComponent | undefined {
  const item = ITEMS.find((entry) => entry.name === slug);
  if (!item) {
    return undefined;
  }
  return {
    description: getAiSeo(slug)?.description ?? item.description ?? "",
    name: item.name,
    title: item.title ?? item.name,
  };
}

/** Every AI-component slug referenced by the groups, de-duplicated. */
export function getAiComponentSlugs(): readonly string[] {
  return [...new Set(AI_COMPONENT_GROUPS.flatMap((group) => group.slugs))];
}
