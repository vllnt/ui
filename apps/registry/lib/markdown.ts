export function stripLeadingMarkdownHeading(content: string): string {
  return content.replace(/^\s*#\s+[^\n]+\n+/, "");
}
