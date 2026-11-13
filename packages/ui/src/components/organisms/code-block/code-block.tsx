"use client";

import {
  type ComponentType,
  type ReactNode,
  type Ref,
  useEffect,
  useRef,
  useState,
} from "react";

import { Check, Copy } from "lucide-react";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";

import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import { useCopyToClipboard } from "../../molecules/copy-button/use-copy-to-clipboard";

type PrismStyle = NonNullable<SyntaxHighlighterProps["style"]>;

type LoadedHighlighter = {
  SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
};

/**
 * Token colours come from `--vllnt-code-*` custom properties (styles.css),
 * so the palette follows the active light / dark theme without detecting it
 * in JS, and every token meets WCAG AA (4.5:1) on the block background.
 */
function codeToken(name: string, fallback: string): { color: string } {
  return { color: `oklch(var(--vllnt-code-${name}, ${fallback}))` };
}

const CODE_THEME: PrismStyle = {
  atrule: codeToken("keyword", "0.5236 0.211 328.8"),
  "attr-name": codeToken("number", "0.5237 0.1156 76.9"),
  "attr-value": codeToken("string", "0.5084 0.1347 144.2"),
  boolean: codeToken("number", "0.5237 0.1156 76.9"),
  builtin: codeToken("class", "0.5078 0.108 73.3"),
  cdata: codeToken("comment", "0.521 0.0234 264.4"),
  char: codeToken("string", "0.5084 0.1347 144.2"),
  "class-name": codeToken("class", "0.5078 0.108 73.3"),
  'code[class*="language-"]': codeToken("text", "0.3496 0.0141 274.5"),
  comment: {
    ...codeToken("comment", "0.521 0.0234 264.4"),
    fontStyle: "italic",
  },
  constant: codeToken("number", "0.5237 0.1156 76.9"),
  deleted: codeToken("variable", "0.5003 0.1821 29.5"),
  doctype: codeToken("comment", "0.521 0.0234 264.4"),
  entity: codeToken("operator", "0.3496 0.0141 274.5"),
  function: codeToken("function", "0.4882 0.2172 264.4"),
  important: codeToken("keyword", "0.5236 0.211 328.8"),
  inserted: codeToken("string", "0.5084 0.1347 144.2"),
  keyword: codeToken("keyword", "0.5236 0.211 328.8"),
  number: codeToken("number", "0.5237 0.1156 76.9"),
  operator: codeToken("operator", "0.3496 0.0141 274.5"),
  'pre[class*="language-"]': codeToken("text", "0.3496 0.0141 274.5"),
  prolog: codeToken("comment", "0.521 0.0234 264.4"),
  property: codeToken("variable", "0.5003 0.1821 29.5"),
  punctuation: codeToken("operator", "0.3496 0.0141 274.5"),
  regex: codeToken("string", "0.5084 0.1347 144.2"),
  selector: codeToken("string", "0.5084 0.1347 144.2"),
  string: codeToken("string", "0.5084 0.1347 144.2"),
  symbol: codeToken("number", "0.5237 0.1156 76.9"),
  tag: codeToken("variable", "0.5003 0.1821 29.5"),
  url: codeToken("operator", "0.3496 0.0141 274.5"),
  variable: codeToken("variable", "0.5003 0.1821 29.5"),
};

const WRAP_CLASS = "whitespace-pre-wrap break-words";

/**
 * Props for {@link CodeBlock}.
 *
 * @public
 */
export type CodeBlockProps = {
  /** Source code to display. Nested elements contribute their text. */
  children: ReactNode;
  /** Class name merged onto the root element. */
  className?: string;
  /** Prism language used to highlight the code. Defaults to `"typescript"`. */
  language?: string;
  /** Show the language label over the code. Ignored when `title` renders a header, which always shows it. */
  showLanguage?: boolean;
  /** Number each line. Defaults to `false`. Numbers are not part of the copied text. */
  showLineNumbers?: boolean;
  /** File name or label. When set, a header row shows it with the language label and the Copy button. */
  title?: ReactNode;
  /** Wrap long lines instead of scrolling horizontally. Defaults to `false`. */
  wrap?: boolean;
};

function extractTextFromChildren(node: ReactNode): string {
  if (typeof node === "string") {
    return node;
  }
  if (typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextFromChildren).join("");
  }
  if (
    node &&
    typeof node === "object" &&
    "props" in node &&
    node.props &&
    typeof node.props === "object" &&
    "children" in node.props
  ) {
    return extractTextFromChildren(node.props.children as ReactNode);
  }
  return String(node ?? "");
}

function findScrollableParent(
  element: HTMLElement | null,
): HTMLElement | undefined {
  if (!element) return undefined;
  if (element.scrollHeight > element.clientHeight) return element;
  return findScrollableParent(element.parentElement);
}

/**
 * Syntax-highlighted code with a Copy button. Pass `title` for a header row
 * (file name, language, Copy), `wrap` to wrap long lines and `showLineNumbers`
 * to number them. A successful copy shows a visible `Copied` word, announced
 * through a polite live region.
 *
 * @example
 * ```tsx
 * <CodeBlock language="tsx" showLineNumbers title="app.tsx" wrap>
 *   {source}
 * </CodeBlock>
 * ```
 *
 * @public
 */
export function CodeBlock({
  children,
  className,
  language = "typescript",
  ref,
  showLanguage = false,
  showLineNumbers = false,
  title,
  wrap = false,
}: CodeBlockProps & { ref?: Ref<HTMLDivElement> }) {
  const { copied, copy } = useCopyToClipboard();
  // The Prism build is dynamic-imported on mount, by deep path rather than
  // the package root (which also pulls highlight.js and every theme), so the
  // @vllnt/ui barrel's static graph never reaches it. Token colours come
  // from CSS variables (CODE_THEME). Null until the chunk loads.
  const [highlighter, setHighlighter] = useState<LoadedHighlighter | null>(
    null,
  );
  const code = extractTextFromChildren(children);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void import("react-syntax-highlighter/dist/esm/prism").then((prism) => {
      if (!active) return;
      setHighlighter({ SyntaxHighlighter: prism.default });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const scrollable = findScrollableParent(element);
      if (scrollable) {
        scrollable.scrollTop += event.deltaY;
        event.preventDefault();
      }
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", onWheel);
    };
  }, []);

  const handleCopy = () => {
    void copy(code);
  };

  const SyntaxHighlighter = highlighter?.SyntaxHighlighter;
  const hasHeader = Boolean(title);

  const languageLabel = (
    <span className="mr-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
      {language}
    </span>
  );

  const Icon = copied ? Check : Copy;

  const copyControl = (
    <>
      <span
        aria-live="polite"
        className={cn(
          "text-xs text-muted-foreground",
          copied && "rounded-sm bg-background px-1",
        )}
        role="status"
      >
        {copied ? "Copied" : null}
      </span>
      <Button
        aria-label="Copy code"
        className="size-8"
        onClick={handleCopy}
        size="icon"
        variant="ghost"
      >
        <Icon className="size-3" />
      </Button>
    </>
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md border bg-background",
        className,
      )}
      ref={ref}
    >
      {hasHeader ? (
        <div className="flex items-center justify-between gap-2 border-b bg-muted/50 py-1 pl-4 pr-2">
          <span className="min-w-0 truncate font-mono text-xs">{title}</span>
          <div className="flex shrink-0 items-center">
            {languageLabel}
            {copyControl}
          </div>
        </div>
      ) : null}
      <div
        className="relative overflow-x-auto overflow-y-hidden touch-pan-y"
        ref={scrollRef}
      >
        {SyntaxHighlighter ? (
          <SyntaxHighlighter
            codeTagProps={{
              className: cn(
                "font-mono text-sm [&_.linenumber]:!not-italic",
                wrap && WRAP_CLASS,
              ),
              style: {
                background: "transparent",
                display: "block",
                whiteSpace: wrap ? "pre-wrap" : "pre",
              },
            }}
            customStyle={{
              background: "oklch(var(--background))",
              fontSize: "0.875rem",
              margin: 0,
              minWidth: "fit-content",
              overflowY: "hidden",
              padding: "1rem",
            }}
            language={language}
            showLineNumbers={showLineNumbers}
            style={CODE_THEME}
          >
            {code}
          </SyntaxHighlighter>
        ) : (
          <pre
            className={cn(
              "m-0 min-w-fit overflow-y-hidden p-4 font-mono text-sm",
              wrap && WRAP_CLASS,
            )}
          >
            <code className="block bg-transparent">{code}</code>
          </pre>
        )}
        {hasHeader ? null : (
          <div className="absolute right-2 top-2 flex items-center">
            {showLanguage ? languageLabel : null}
            {copyControl}
          </div>
        )}
      </div>
    </div>
  );
}
CodeBlock.displayName = "CodeBlock";
