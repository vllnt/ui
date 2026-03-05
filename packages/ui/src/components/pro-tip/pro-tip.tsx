import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type ProTipVariant =
  | "advanced"
  | "best-practice"
  | "expert"
  | "gotcha"
  | "performance"
  | "tip";

export type ProTipProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  title?: string;
  variant?: ProTipVariant;
};

const variantStyles: Record<
  ProTipVariant,
  { className: string; defaultTitle: string }
> = {
  advanced: {
    className:
      "border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    defaultTitle: "Advanced",
  },
  "best-practice": {
    className:
      "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    defaultTitle: "Best Practice",
  },
  expert: {
    className:
      "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    defaultTitle: "Expert Tip",
  },
  gotcha: {
    className: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300",
    defaultTitle: "Common Gotcha",
  },
  performance: {
    className:
      "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300",
    defaultTitle: "Performance",
  },
  tip: {
    className: "border-primary/50 bg-primary/10 text-primary",
    defaultTitle: "Pro Tip",
  },
};

export function ProTip({
  children,
  className,
  icon,
  title,
  variant = "tip",
}: ProTipProps): React.ReactNode {
  const config = variantStyles[variant];

  return (
    <div
      className={cn("my-6 rounded-lg border p-4", config.className, className)}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-current/10 flex-shrink-0">
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1">
            {title || config.defaultTitle}
          </p>
          <div className="text-sm [&>p]:mb-0 opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}

export type CommonMistakeProps = {
  children: ReactNode;
  className?: string;
  fix?: ReactNode;
  fixIcon?: ReactNode;
  icon?: ReactNode;
  title?: string;
};

// eslint-disable-next-line max-lines-per-function -- Complex component with conditional fix section
export function CommonMistake({
  children,
  className,
  fix,
  fixIcon,
  icon,
  title = "Common Mistake",
}: CommonMistakeProps): React.ReactNode {
  return (
    <div
      className={cn(
        "my-6 rounded-lg border border-red-500/50 bg-red-500/5 overflow-hidden",
        className,
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {icon ? (
            <span className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5">
              {icon}
            </span>
          ) : (
            <svg
              className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-red-700 dark:text-red-300 mb-1">
              {title}
            </p>
            <div className="text-sm text-muted-foreground [&>p]:mb-0">
              {children}
            </div>
          </div>
        </div>
      </div>
      {fix ? (
        <div className="border-t border-red-500/30 bg-green-500/5 p-4">
          <div className="flex items-start gap-3">
            {fixIcon ? (
              <span className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5">
                {fixIcon}
              </span>
            ) : (
              <svg
                className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-green-700 dark:text-green-300 mb-1">
                The Fix
              </p>
              <div className="text-sm text-muted-foreground [&>p]:mb-0">
                {fix}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
