import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@vllnt/ui";

const buttonGroupVariants = cva(
  "isolate inline-flex w-fit [&>*:focus-visible]:z-10 [&>*:focus-within]:z-10",
  {
    defaultVariants: {
      orientation: "horizontal",
    },
    variants: {
      orientation: {
        horizontal:
          "flex-row [&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
        vertical:
          "flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
      },
    },
  },
);

/**
 * Visually connected group of buttons that share borders.
 *
 * @example
 * <ButtonGroup>
 *   <Button variant="outline">Prev</Button>
 *   <Button variant="outline">Next</Button>
 * </ButtonGroup>
 */
export type ButtonGroupProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof buttonGroupVariants>;

const ButtonGroup = ({
  className,
  orientation,
  ref,
  ...props
}: ButtonGroupProps & { ref?: React.Ref<HTMLDivElement> }) => (
  <div
    className={cn(buttonGroupVariants({ orientation }), className)}
    data-slot="button-group"
    ref={ref}
    role="group"
    {...props}
  />
);
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup, buttonGroupVariants };
