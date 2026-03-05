"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import { cn } from "../../lib/utils";
import { Button } from "../button/button";

type CodeBlockProps = {
  children: ReactNode;
  className?: string;
  language?: string;
  showLanguage?: boolean;
};

function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    children.props &&
    typeof children.props === "object" &&
    "children" in children.props
  ) {
    return extractTextFromChildren(children.props.children as ReactNode);
  }
  return String(children ?? "");
}

// eslint-disable-next-line max-lines-per-function
export function CodeBlock({
  children,
  className,
  language = "typescript",
  showLanguage = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { systemTheme, theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = resolvedTheme === "dark";
  const codeStyle = isDark ? oneDark : oneLight;
  const code = extractTextFromChildren(children);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md border bg-background",
          className,
        )}
      >
        <div className="relative overflow-x-auto">
          <pre className="p-4 text-sm font-mono bg-background">
            <code>{code}</code>
          </pre>
          <div className="absolute right-2 top-2 flex items-center gap-2">
            {showLanguage ? (
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                {language}
              </span>
            ) : null}
            <Button
              className="h-8 w-8"
              onClick={handleCopy}
              size="icon"
              variant="ghost"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md border bg-background",
        className,
      )}
    >
      <div className="relative overflow-x-auto">
        <SyntaxHighlighter
          codeTagProps={{
            className: "font-mono text-sm",
          }}
          customStyle={{
            background: "hsl(var(--background))",
            fontSize: "0.875rem",
            margin: 0,
            minWidth: "fit-content",
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
            className="h-8 w-8"
            onClick={handleCopy}
            size="icon"
            variant="ghost"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
