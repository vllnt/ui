import { cn } from "../../lib/utils";

export type TruncatedTextProps = {
  /**
   * The text content to display
   */
  children: string;
  /**
   * Optional CSS class name
   */
  className?: string;
  /**
   * Max width for the visible container (default: 'calc(100vw - 220px)')
   */
  maxWidth?: string;
};

/**
 * TruncatedText component with ellipsis for long text
 *
 * Displays text with ellipsis (...) when content overflows.
 * On mobile, truncates within a constrained container.
 * On desktop (≥640px), displays full text.
 *
 * @example
 * ```tsx
 * <TruncatedText>
 *   Production Claude Code Workflows
 * </TruncatedText>
 * ```
 */
export function TruncatedText({
  children,
  className,
  maxWidth = "calc(100vw - 220px)",
}: TruncatedTextProps) {
  return (
    <span
      className={cn(
        "inline-block align-middle overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-none sm:overflow-visible",
        className,
      )}
      style={{
        maxWidth,
      }}
      title={children}
    >
      {children}
    </span>
  );
}
