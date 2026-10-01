import { cn } from "../../../lib/utils";

export type SpinnerProps = {
  size?: "lg" | "md" | "sm";
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Loading indicator. Under `prefers-reduced-motion` it keeps turning, slower,
 * because the motion is the loading feedback itself (`data-motion="essential"`
 * exempts it from the global reduced-motion rule in styles.css).
 */
function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:[animation-duration:1.5s]",
        {
          "size-4": size === "sm",
          "size-6": size === "md",
          "size-8": size === "lg",
        },
        className,
      )}
      data-motion="essential"
      {...props}
    >
      <span className="sr-only">Loading&hellip;</span>
    </div>
  );
}

export { Spinner };
