import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link AnimatedList}. */
export type AnimatedListProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Stagger between item entrances in milliseconds. Defaults to `100`. */
  delay?: number;
};

/**
 * Wrapper that fades and slides its children in with a staggered delay.
 *
 * Respects `prefers-reduced-motion`: items appear without motion.
 *
 * @example
 * ```tsx
 * <AnimatedList>
 *   <span>First</span>
 *   <span>Second</span>
 * </AnimatedList>
 * ```
 */
export const AnimatedList = ({
  children,
  className,
  delay = 100,
  ref,
  ...props
}: AnimatedListProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const items = React.Children.toArray(children);

  return (
    <div className={cn("flex flex-col gap-2", className)} ref={ref} {...props}>
      {items.map((child, index) => (
        <span
          className="block animate-in fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none"
          key={index}
          style={{
            animationDelay: `${index * delay}ms`,
            animationFillMode: "both",
          }}
        >
          {child}
        </span>
      ))}
    </div>
  );
};
AnimatedList.displayName = "AnimatedList";
