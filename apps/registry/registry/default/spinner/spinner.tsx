import { cn } from "@vllnt/ui";

export type SpinnerProps = {
  size?: "lg" | "md" | "sm";
} & React.HTMLAttributes<HTMLDivElement>;

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        {
          "size-4": size === "sm",
          "size-6": size === "md",
          "size-8": size === "lg",
        },
        className,
      )}
      {...props}
    >
      <span className="sr-only">Loading&hellip;</span>
    </div>
  );
}

export { Spinner };
