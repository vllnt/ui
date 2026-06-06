/**
 * Use-case landing pages (`/build/[slug]`). Each targets a high-intent "how do I
 * build X" query and routes the visitor to the AI components that solve it —
 * capturing Funnel-A demand and feeding answer engines a copy-paste answer.
 */

export type UseCaseFaq = {
  readonly answer: string;
  readonly question: string;
};

export type UseCase = {
  /** Component slugs that solve this use-case, in build order. */
  readonly componentSlugs: readonly string[];
  /** Meta description (~150–160 chars). */
  readonly description: string;
  readonly faq: readonly UseCaseFaq[];
  /** Problem framing rendered under the H1. */
  readonly intro: string;
  /** URL slug under /build/. */
  readonly slug: string;
  /** H1 + OG title (no brand suffix). */
  readonly title: string;
};

export const USE_CASES: readonly UseCase[] = [
  {
    componentSlugs: [
      "ai-chat-input",
      "ai-message-bubble",
      "ai-streaming-text",
      "ai-sidebar",
    ],
    description:
      "Build an AI chat interface in React with open-source components: prompt input, message bubbles, and streaming output. Install via the shadcn CLI.",
    faq: [
      {
        answer:
          "A composer (AI Chat Input), a way to render turns (AI Message Bubble), and streaming output (AI Streaming Text). AI Sidebar lets you embed the chat as a co-pilot beside an existing app.",
        question: "What components do I need for an AI chat UI?",
      },
      {
        answer:
          "Yes. The components are presentational — wire their callbacks and state to the Vercel AI SDK, LangChain, or any custom streaming endpoint.",
        question: "Does this work with the Vercel AI SDK or my own backend?",
      },
    ],
    intro:
      "Every AI chat app needs the same three surfaces: a composer to send prompts, bubbles to render the conversation, and streaming output as the model responds. These components give you all three — accessible, themeable, and ready to wire to any model or agent runtime.",
    slug: "ai-chat-ui",
    title: "Build an AI chat UI in React",
  },
  {
    componentSlugs: [
      "ai-tool-call-display",
      "agent-activity",
      "thinking-block",
    ],
    description:
      "Show an AI agent's tool calls and multi-step execution in React: arguments, status, results, and a live activity timeline. Install via the shadcn CLI.",
    faq: [
      {
        answer:
          "Use AI Tool Call Display for each invocation — it renders the tool name, serialized arguments, status, and returned output. Pair it with Agent Activity to show the full multi-step run.",
        question: "How do I display an agent's function/tool calls?",
      },
      {
        answer:
          "Yes — Thinking Block renders streaming chain-of-thought in a collapsible panel, separate from the final answer.",
        question: "Can I show the agent's reasoning?",
      },
    ],
    intro:
      "Agentic apps are only trustworthy when users can see what the agent is doing. Render each tool invocation with its arguments and result, surface the agent's reasoning, and show the whole run as a live timeline.",
    slug: "tool-calls-agent-steps",
    title: "Render tool calls & agent steps in React",
  },
  {
    componentSlugs: ["ai-source-citation", "ai-message-bubble"],
    description:
      "Make AI answers verifiable in React with source citation components for RAG: title, origin, and excerpt next to each grounded response. Install via the shadcn CLI.",
    faq: [
      {
        answer:
          "Render an AI Source Citation card per retrieved source — each shows a title, origin label, and optional excerpt — beneath the AI Message Bubble that contains the answer.",
        question: "How do I show sources for a RAG answer?",
      },
    ],
    intro:
      "Retrieval-augmented answers need attribution to be trusted. Render the sources behind each response as compact citation cards so users can verify where the AI got its information.",
    slug: "rag-citations",
    title: "Show RAG sources & citations in React",
  },
  {
    componentSlugs: ["ai-artifact", "canvas-shell", "completion-dialog"],
    description:
      "Give AI-generated content its own panel in React: an artifacts/canvas surface with toolbar, versions, and a task-completion dialog. Install via the shadcn CLI.",
    faq: [
      {
        answer:
          "It's the side panel that holds substantial AI output (popularized by Claude Artifacts and ChatGPT Canvas). AI Artifact gives you the rendered output area with a toolbar and version chips; Canvas Shell provides the surrounding workspace.",
        question: "What is the artifacts / canvas pattern?",
      },
    ],
    intro:
      "When an AI generates something substantial — code, a document, a design — it deserves its own space beside the chat. Render it as an artifact with copy, edit, download, and version controls, then close out the run with a completion dialog.",
    slug: "ai-artifacts",
    title: "Add AI artifacts & canvas to your app",
  },
  {
    componentSlugs: ["model-comparison", "prompt-templates"],
    description:
      "Compare AI model responses side by side in React with blind mode, vote bars, and a reusable prompt library. Build LLM evals into your product. Install via shadcn CLI.",
    faq: [
      {
        answer:
          "Use Model Comparison to render two responses side by side with blind mode and a vote bar — suitable for human-preference evals. Pair it with Prompt Templates so testers can reuse curated prompts.",
        question: "How do I build an LLM comparison or eval UI?",
      },
    ],
    intro:
      "Evaluating models — or letting users pick a winner — needs a side-by-side surface. Compare two responses with optional blind mode and a vote bar, and give users a reusable, fillable prompt library to test with.",
    slug: "model-comparison",
    title: "Compare LLM responses in your UI",
  },
];

export function getUseCase(slug: string): undefined | UseCase {
  return USE_CASES.find((useCase) => useCase.slug === slug);
}

export function getUseCasePath(useCase: UseCase): string {
  return `/build/${useCase.slug}`;
}
