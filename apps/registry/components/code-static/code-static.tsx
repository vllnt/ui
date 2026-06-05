import { CopyCode } from "./copy-code";

type CodeStaticProps = {
  className?: string;
  code: string;
  language?: string;
};

/**
 * Zero-JS server component for displaying a code snippet. Renders static markup
 * so the client never loads a syntax highlighter; the copy button is the one
 * client island.
 */
export function CodeStatic({ className, code }: CodeStaticProps) {
  return (
    <div
      className={`group relative overflow-x-auto rounded-lg border border-border bg-card ${className ?? ""}`}
    >
      <pre className="overflow-x-auto p-4 text-sm">
        <code className="font-mono">{code}</code>
      </pre>
      <CopyCode value={code} />
    </div>
  );
}
