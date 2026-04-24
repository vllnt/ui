import { forwardRef } from "react";

import { cva } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Clock3, Wrench } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";

const statusVariants = cva(
  "rounded-full px-2 py-0 text-[10px] uppercase tracking-wide",
  {
    defaultVariants: {
      status: "queued",
    },
    variants: {
      status: {
        complete: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        error: "bg-red-500/10 text-red-700 dark:text-red-300",
        queued: "bg-muted text-muted-foreground",
        running: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      },
    },
  },
);

export type AIToolCallStatus = "complete" | "error" | "queued" | "running";

export type AIToolCallDisplayProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Short description of the tool output. */
  description?: string;
  /** Optional execution duration label. */
  duration?: string;
  /** Serialized tool arguments or input payload. */
  input?: string;
  /** Serialized tool result or output payload. */
  output?: string;
  /** Current tool execution state. */
  status?: AIToolCallStatus;
  /** Name of the tool. */
  toolName: string;
};

const statusIconMap: Record<AIToolCallStatus, React.ReactNode> = {
  complete: <CheckCircle2 className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
  queued: <Clock3 className="h-4 w-4" />,
  running: <Wrench className="h-4 w-4 animate-pulse" />,
};

const AIToolCallDisplay = forwardRef<HTMLDivElement, AIToolCallDisplayProps>(
  (
    {
      className,
      description,
      duration,
      input,
      output,
      status = "queued",
      toolName,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              {statusIconMap[status]}
              <span>{toolName}</span>
            </div>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {duration ? (
              <span className="text-xs text-muted-foreground">{duration}</span>
            ) : null}
            <Badge className={statusVariants({ status })} variant="secondary">
              {status}
            </Badge>
          </div>
        </div>

        {input ? (
          <details
            className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-3"
            open={status !== "complete"}
          >
            <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tool input
            </summary>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-foreground">
              {input}
            </pre>
          </details>
        ) : null}

        {output ? (
          <details
            className="mt-3 rounded-xl border border-border/60 bg-muted/20 p-3"
            open={status !== "complete"}
          >
            <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tool output
            </summary>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-foreground">
              {output}
            </pre>
          </details>
        ) : null}
      </div>
    );
  },
);

AIToolCallDisplay.displayName = "AIToolCallDisplay";

export { AIToolCallDisplay };
