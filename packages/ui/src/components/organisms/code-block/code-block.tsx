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
