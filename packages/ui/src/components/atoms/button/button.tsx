import { Slot } from "@radix-ui/react-slot";
import { cva, cx, type VariantProps } from "class-variance-authority";
import type { ClassValue } from "clsx";

import { cn } from "../../../lib/utils";

const styledButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-4 py-2",
        icon: "size-10",
        "icon-lg": "size-11",
        lg: "h-11 rounded-md px-8",
        sm: "h-9 rounded-md px-3",
      },
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
    },
  },
);

type StyledButtonOptions = NonNullable<
  Parameters<typeof styledButtonVariants>[0]
>;

/** {@link buttonVariants} options: the styled variants plus `"unstyled"`. */
type ButtonVariantOptions = {
  class?: ClassValue;
  className?: ClassValue;
  size?: StyledButtonOptions["size"];
  variant?: "unstyled" | StyledButtonOptions["variant"];
};

/**
 * Button classes. `variant: "unstyled"` adds none of its own: the result is
 * the caller's `className` (or `class`), and `size` has no effect.
 */
const buttonVariants = ({
  class: classValue,
  className,
  size,
  variant,
}: ButtonVariantOptions = {}): string =>
  variant === "unstyled"
    ? cx(classValue, className)
    : styledButtonVariants({
        className: cx(classValue, className),
        size,
        variant,
      });

export type ButtonProps = {
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = ({
  asChild = false,
  className,
  ref: reference,
  size,
  variant,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      // An unstyled button with no className renders no class attribute.
      className={cn(buttonVariants({ className, size, variant })) || undefined}
      ref={reference}
      {...props}
    />
  );
};
Button.displayName = "Button";

export { Button, buttonVariants };
