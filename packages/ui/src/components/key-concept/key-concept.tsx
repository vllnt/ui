import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type KeyConceptProps = {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
  icon?: ReactNode;
  term: string;
};

export function KeyConcept({
  children,
  className,
  highlight = false,
  icon,
  term,
}: KeyConceptProps): React.ReactNode {
  return (
    <div
      className={cn(
        "my-4 rounded-lg border p-4",
        highlight
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-muted/30",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="h-5 w-5 text-primary flex-shrink-0 mt-0.5">
            {icon}
          </span>
        ) : (
          <svg
            className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        )}
        <div className="flex-1 min-w-0">
          <dt className="font-bold text-foreground mb-1">{term}</dt>
          <dd className="text-sm text-muted-foreground [&>p]:mb-0">
            {children}
          </dd>
        </div>
      </div>
    </div>
  );
}

export type GlossaryProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  title?: string;
};

export function Glossary({
  children,
  className,
  icon,
  title = "Key Terms",
}: GlossaryProps): React.ReactNode {
  return (
    <div className={cn("my-6", className)}>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        {icon ? (
          <span className="h-4 w-4">{icon}</span>
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        )}
        {title}
      </h4>
      <dl className="space-y-2">{children}</dl>
    </div>
  );
}
