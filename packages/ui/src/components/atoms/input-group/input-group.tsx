import * as React from "react";

import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "../../../lib/variants";

const inputGroupVariants = cva(
  "flex w-full items-center overflow-hidden rounded-md border border-input bg-background text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
);

const inputGroupAddonVariants = cva(
  "flex shrink-0 items-center text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0",
  {
    defaultVariants: {
      align: "leading",
    },
    variants: {
      align: {
        leading: "pl-3",
        trailing: "pr-3",
      },
    },
  },
);

/** Container that groups an input with leading or trailing addons. */
export type InputGroupProps = React.ComponentPropsWithoutRef<"div">;

const InputGroup = /* @__PURE__ */ named(
  "InputGroup",
  ({
    className,
    ref,
    ...props
  }: InputGroupProps & { ref?: React.Ref<HTMLDivElement> }) => (
    <div
      className={cn(inputGroupVariants(), className)}
      data-slot="input-group"
      ref={ref}
      role="group"
      {...props}
    />
  ),
);

/** Leading or trailing addon (icon, text, or action) inside an InputGroup. */
export type InputGroupAddonProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof inputGroupAddonVariants>;

const InputGroupAddon = /* @__PURE__ */ named(
  "InputGroupAddon",
  ({
    align,
    className,
    ref,
    ...props
  }: InputGroupAddonProps & { ref?: React.Ref<HTMLDivElement> }) => (
    <div
      className={cn(inputGroupAddonVariants({ align }), className)}
      data-slot="input-group-addon"
      ref={ref}
      {...props}
    />
  ),
);

/** Borderless input that fills the remaining space inside an InputGroup. */
export type InputGroupInputProps = React.ComponentPropsWithoutRef<"input">;

const InputGroupInput = /* @__PURE__ */ named(
  "InputGroupInput",
  ({
    className,
    ref,
    ...props
  }: InputGroupInputProps & { ref?: React.Ref<HTMLInputElement> }) => (
    <input
      className={cn(
        "h-10 w-full flex-1 bg-transparent px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

export {
  InputGroup,
  InputGroupAddon,
  inputGroupAddonVariants,
  InputGroupInput,
  inputGroupVariants,
};
