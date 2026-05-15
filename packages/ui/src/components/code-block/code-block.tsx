"use client";

import { Children, isValidElement, useState } from "react";

import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode, WheelEvent } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import { cn } from "../../lib/utils";
import { Button } from "../button/button";

type CodeBlockProps = {
  children?: ReactNode;
  className?: string;
  code?: string;
  language?: string;
  showLanguage?: boolean;
};

export function extractTextFromChildren(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (isValidElement<{ children?: ReactNode }>(child)) {
        return extractTextFromChildren(child.props.children);
      }
      return "";
    })
    .join("");
}

function findScrollableParent(
  element: HTMLElement | null,
): HTMLElement | undefined {
  if (!element) return undefined;
  if (element.scrollHeight > element.clientHeight) return element;
  return findScrollableParent(element.parentElement);
}

function redirectVerticalWheel(event: WheelEvent<HTMLDivElement>): void {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  const scrollable = findScrollableParent(event.currentTarget);
  if (scrollable) {
    scrollable.scrollTop += event.deltaY;
    event.preventDefault();
  }
}

export function CodeBlock({
  children,
  className,
  code: codeProperty,
  language = "typescript",
  showLanguage = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { systemTheme, theme } = useTheme();

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = resolvedTheme !== "light";
  const codeStyle = isDark ? oneDark : oneLight;
  const code = codeProperty ?? extractTextFromChildren(children);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md border bg-background",
        className,
      )}
    >
      <div
        className="relative overflow-x-auto overflow-y-hidden touch-pan-y"
        onWheel={redirectVerticalWheel}
      >
        <SyntaxHighlighter
          codeTagProps={{
            className: "font-mono text-sm",
            style: {
              background: "transparent",
              display: "block",
            },
          }}
          customStyle={{
            background: "hsl(var(--background))",
            fontSize: "0.875rem",
            margin: 0,
            minWidth: "fit-content",
            overflowY: "hidden",
            padding: "1rem",
          }}
          language={language}
          style={codeStyle}
        >
          {code}
        </SyntaxHighlighter>
        <div className="absolute right-2 top-2 flex items-center gap-2">
          {showLanguage ? (
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {language}
            </span>
          ) : null}
          <Button
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
