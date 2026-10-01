"use client";

import {
  type ComponentType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { Check, Copy } from "lucide-react";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";

import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import { useCopyToClipboard } from "../../molecules/copy-button/copy-button";

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
  return { color: `var(--vllnt-code-${name}, ${fallback})` };
}

const CODE_THEME: PrismStyle = {
  atrule: codeToken("keyword", "#a626a4"),
  "attr-name": codeToken("number", "#986801"),
  "attr-value": codeToken("string", "#2e7d32"),
  boolean: codeToken("number", "#986801"),
  builtin: codeToken("class", "#8a5a00"),
  cdata: codeToken("comment", "#6b7280"),
  char: codeToken("string", "#2e7d32"),
  "class-name": codeToken("class", "#8a5a00"),
  'code[class*="language-"]': codeToken("text", "#383a42"),
  comment: { ...codeToken("comment", "#6b7280"), fontStyle: "italic" },
  constant: codeToken("number", "#986801"),
  deleted: codeToken("variable", "#b42318"),
  doctype: codeToken("comment", "#6b7280"),
  entity: codeToken("operator", "#383a42"),
  function: codeToken("function", "#1d4ed8"),
  important: codeToken("keyword", "#a626a4"),
  inserted: codeToken("string", "#2e7d32"),
  keyword: codeToken("keyword", "#a626a4"),
  number: codeToken("number", "#986801"),
  operator: codeToken("operator", "#383a42"),
  'pre[class*="language-"]': codeToken("text", "#383a42"),
  prolog: codeToken("comment", "#6b7280"),
  property: codeToken("variable", "#b42318"),
  punctuation: codeToken("operator", "#383a42"),
  regex: codeToken("string", "#2e7d32"),
  selector: codeToken("string", "#2e7d32"),
  string: codeToken("string", "#2e7d32"),
  symbol: codeToken("number", "#986801"),
  tag: codeToken("variable", "#b42318"),
  url: codeToken("operator", "#383a42"),
  variable: codeToken("variable", "#b42318"),
};

type CodeBlockProps = {
  children: ReactNode;
  className?: string;
  language?: string;
  showLanguage?: boolean;
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

export function CodeBlock({
  children,
  className,
  language = "typescript",
  showLanguage = false,
}: CodeBlockProps) {
  const { copied, copy } = useCopyToClipboard();
  // react-syntax-highlighter (~10MB) is dynamic-imported on mount so the
  // @vllnt/ui barrel's static graph never reaches it — barrel consumers that
  // never render a CodeBlock ship zero bytes of it. Null until the chunk loads.
  const [highlighter, setHighlighter] = useState<LoadedHighlighter | null>(
    null,
  );
  const code = extractTextFromChildren(children);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void import("react-syntax-highlighter").then((module_) => {
      if (!active) return;
      setHighlighter({ SyntaxHighlighter: module_.Prism });
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

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md border bg-background",
        className,
      )}
    >
      <div
        className="relative overflow-x-auto overflow-y-hidden touch-pan-y"
        ref={scrollRef}
      >
        {SyntaxHighlighter ? (
          <SyntaxHighlighter
            codeTagProps={{
              className: "font-mono text-sm",
              style: {
                background: "transparent",
                display: "block",
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
            style={CODE_THEME}
          >
            {code}
          </SyntaxHighlighter>
        ) : (
          <pre className="m-0 min-w-fit overflow-y-hidden p-4 font-mono text-sm">
            <code className="block bg-transparent">{code}</code>
          </pre>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-2">
          {showLanguage ? (
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {language}
            </span>
          ) : null}
          <Button
            aria-label={copied ? "Copied" : "Copy code"}
            className="size-8"
            onClick={handleCopy}
            size="icon"
            variant="ghost"
          >
            {copied ? (
              <Check className="size-3" />
            ) : (
              <Copy className="size-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
