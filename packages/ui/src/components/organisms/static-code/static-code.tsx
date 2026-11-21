import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { CodeHighlighter } from "../../../lib/code-highlighter";
import { cn } from "../../../lib/utils";

import { StaticCodeCopy } from "./static-code-copy";

export type StaticCodeProps = {
  className?: string;
  code: string;
  language?: string;
};

/**
 * Server component that highlights code to static HTML at build/request time
 * (react-syntax-highlighter rendered on the server) so the client never loads
 * or runs the highlighter. The copy button is the one client island. Uses a
 * fixed dark theme to stay deterministic without reading the client theme.
 * Highlights the languages registered in `lib/code-highlighter.ts`; any other
 * language renders as plain text.
 */
export function StaticCode({
  className,
  code,
  language = "tsx",
}: StaticCodeProps) {
  return (
    <div
      className={cn(
        "group relative overflow-x-auto rounded-lg border border-border bg-[#282c34]",
        className,
      )}
    >
      <CodeHighlighter
        customStyle={{
          background: "transparent",
          fontSize: "0.875rem",
          margin: 0,
          padding: "1rem",
        }}
        language={language}
        PreTag="div"
        style={oneDark}
      >
        {code}
      </CodeHighlighter>
      <StaticCodeCopy value={code} />
    </div>
  );
}
