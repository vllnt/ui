import Link from "next/link";
import type * as React from "react";

import { cn } from "../../lib/utils";

export type BreadcrumbItem = {
  href?: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
};

type BreadcrumbProps = {
  className?: string;
  items: BreadcrumbItem[];
  separator?: "arrow" | "chevron" | "slash";
  showHomeIcon?: boolean;
  variant?: "default" | "minimal";
};

const SEPARATOR_CHARS: Record<string, string> = {
  arrow: "→",
  chevron: "›",
  slash: "/",
};

function SeparatorIcon({ type }: { type: string }) {
  return (
    <span aria-hidden="true" className="text-muted-foreground">
      {SEPARATOR_CHARS[type] ?? "›"}
    </span>
  );
}

export function Breadcrumb({
  className,
  items,
  separator = "chevron",
  variant = "default",
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm", className)}
    >
      {items.map((item, index) => (
        <div className="flex items-center" key={index}>
          {index > 0 && (
            <span className="mx-2">
              <SeparatorIcon type={separator} />
            </span>
          )}

          {item.href ? (
            <Link
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              href={item.href}
            >
              {item.icon ? (
                <span className="flex-shrink-0">{item.icon}</span>
              ) : null}
              <span
                className={cn(
                  // Truncate plain string labels; custom React elements handle their own overflow
                  typeof item.label === "string" && "truncate",
                  variant === "minimal"
                    ? "text-muted-foreground"
                    : "text-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              {item.icon ? (
                <span className="flex-shrink-0">{item.icon}</span>
              ) : null}
              <span
                className={cn(typeof item.label === "string" && "truncate")}
              >
                {item.label}
              </span>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
