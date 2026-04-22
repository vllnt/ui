import { forwardRef } from "react";

import { ExternalLink, Quote } from "lucide-react";

import { cn } from "../../lib/utils";

export type AISourceCitationProps = React.ComponentPropsWithoutRef<"a"> & {
  /** Optional short excerpt from the cited source. */
  snippet?: string;
  /** Source label such as domain, document, or collection. */
  source: string;
  /** Primary citation title. */
  title: string;
};

const AISourceCitation = forwardRef<HTMLAnchorElement, AISourceCitationProps>(
  (
    { className, href, snippet, source, target = "_blank", title, ...props },
    ref,
  ) => {
    return (
      <a
        className={cn(
          "group inline-flex max-w-full flex-col gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-left shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
        href={href}
        ref={ref}
        rel={target === "_blank" ? "noreferrer" : undefined}
        target={target}
        {...props}
      >
        <div className="flex items-start gap-2">
          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground">{source}</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>

        {snippet ? (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {snippet}
          </p>
        ) : null}
      </a>
    );
  },
);

AISourceCitation.displayName = "AISourceCitation";

export { AISourceCitation };
