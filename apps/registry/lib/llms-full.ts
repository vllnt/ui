/**
 * `llms-full.txt` builder. `@vllnt/next-llms` 0.1.0 (stable) ships the
 * `llms.txt` and markdown route helpers; its canary `generateLlmsFullText` was
 * not kept, so the site owns this small renderer.
 *
 * Hierarchy: `# {title}` (site) → `## {section}` → `### {page}` + the page body.
 *
 * @see https://llmstxt.org
 */

/** A page whose full markdown content goes inline into `llms-full.txt`. */
export type LlmsFullPage = {
  /** The page's full markdown content. */
  content: string;
  /** Page title, rendered as a `### {title}` heading. */
  title: string;
  /** Optional source URL, rendered as a `Source: {url}` line under the title. */
  url?: string;
};

/** A named group of pages, rendered as a `## {title}` section. */
export type LlmsFullSection = {
  pages: readonly LlmsFullPage[];
  title: string;
};

export type LlmsFullConfig = {
  /** Free-form markdown shown after the summary. */
  details?: string;
  sections: readonly LlmsFullSection[];
  /** One-line summary, rendered as a `> {summary}` blockquote. */
  summary?: string;
  /** Site name, rendered as the `# {title}` heading. */
  title: string;
};

function renderPage(page: LlmsFullPage): string {
  const head = page.url
    ? `### ${page.title}\n\nSource: ${page.url}`
    : `### ${page.title}`;
  return `${head}\n\n${page.content}`;
}

function renderSection(section: LlmsFullSection): string {
  const heading = `## ${section.title}`;
  const pages = section.pages.map(renderPage).join("\n\n");
  return pages ? `${heading}\n\n${pages}` : heading;
}

/** Returns the `llms-full.txt` contents (no trailing newline). */
export function generateLlmsFullText(config: LlmsFullConfig): string {
  return [
    `# ${config.title}`,
    ...(config.summary ? [`> ${config.summary}`] : []),
    ...(config.details ? [config.details] : []),
    ...config.sections.map(renderSection),
  ].join("\n\n");
}
