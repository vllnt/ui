import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { cn } from "../../lib/utils";

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
      <SyntaxHighlighter
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
      </SyntaxHighlighter>
      <StaticCodeCopy value={code} />
    </div>
  );
}
