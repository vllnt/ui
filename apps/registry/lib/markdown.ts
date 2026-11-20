const LEADING_HEADING = /^\s*#\s+([^\n]+)\n+/;

export function stripLeadingMarkdownHeading(content: string): string {
  return content.replace(LEADING_HEADING, "");
}

/**
 * The text of the heading a document opens with.
 *
 * @param content - markdown
 * @returns The heading text, or `undefined` when the document opens with
 *   something else
 */
export function leadingMarkdownHeading(content: string): string | undefined {
  return LEADING_HEADING.exec(content)?.[1]?.trim();
}
