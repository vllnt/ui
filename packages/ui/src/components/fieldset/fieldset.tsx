import * as React from "react";

import { cn } from "../../lib/utils";

/** Groups related fields under a shared legend. */
export type FieldsetProps = React.ComponentPropsWithoutRef<"fieldset">;

const Fieldset = ({
  className,
  ref,
  ...props
}: FieldsetProps & { ref?: React.Ref<HTMLFieldSetElement> }) => (
  <fieldset
    className={cn("flex min-w-0 flex-col gap-4 disabled:opacity-50", className)}
    data-slot="fieldset"
    ref={ref}
    {...props}
  />
);
Fieldset.displayName = "Fieldset";

/** Caption that names the purpose of a Fieldset. */
export type FieldsetLegendProps = React.ComponentPropsWithoutRef<"legend">;

const FieldsetLegend = ({
  className,
  ref,
  ...props
}: FieldsetLegendProps & { ref?: React.Ref<HTMLLegendElement> }) => (
  <legend
    className={cn("text-sm font-medium leading-none", className)}
    data-slot="fieldset-legend"
    ref={ref}
    {...props}
  />
);
FieldsetLegend.displayName = "FieldsetLegend";

/** Body wrapper that spaces the controls inside a Fieldset. */
export type FieldsetContentProps = React.ComponentPropsWithoutRef<"div">;

const FieldsetContent = ({
  className,
  ref,
  ...props
}: FieldsetContentProps & { ref?: React.Ref<HTMLDivElement> }) => (
  <div
    className={cn("flex flex-col gap-4", className)}
    data-slot="fieldset-content"
    ref={ref}
    {...props}
  />
);
FieldsetContent.displayName = "FieldsetContent";

export { Fieldset, FieldsetContent, FieldsetLegend };
