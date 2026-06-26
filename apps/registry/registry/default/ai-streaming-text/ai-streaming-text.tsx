import { cn } from "@vllnt/ui";

export type AIStreamingTextProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Cursor glyph shown while streaming. */
  cursor?: string;
  /** Whether new content is still arriving. */
  isStreaming?: boolean;
  /** Whether to show the streaming cursor. */
  showCursor?: boolean;
  /** Text content available from the stream. */
  text: string;
};

const AIStreamingText = ({
  className,
  cursor = "▍",
  isStreaming = false,
  ref,
  showCursor = true,
  text,
  ...props
}: AIStreamingTextProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      aria-live={isStreaming ? "polite" : undefined}
      className={cn(
        "text-sm leading-6 text-foreground whitespace-pre-wrap",
        className,
      )}
      ref={ref}
      {...props}
    >
      {text}
      {isStreaming && showCursor ? (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block animate-pulse text-muted-foreground"
        >
          {cursor}
        </span>
      ) : null}
    </div>
  );
};

AIStreamingText.displayName = "AIStreamingText";

export { AIStreamingText };
