"use client";

import {
  Collapsible as CollapsiblePrimitive,
  CollapsiblePanel,
  CollapsibleTrigger as CollapsibleTriggerPrimitive,
} from "@ui-sdk/react/collapsible";
import type * as React from "react";

import {
  asChildProps,
  openState,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

type PartProps<Part extends React.ElementType> = Omit<
  React.ComponentProps<Part>,
  "render"
> & {
  asChild?: boolean;
};

const Collapsible = ({
  asChild,
  children,
  ...props
}: PartProps<typeof CollapsiblePrimitive>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <CollapsiblePrimitive
      render={withDataAttributes("div", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </CollapsiblePrimitive>
  );
};
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = ({
  asChild,
  children,
  ...props
}: PartProps<typeof CollapsibleTriggerPrimitive>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <CollapsibleTriggerPrimitive
      render={withDataAttributes("button", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </CollapsibleTriggerPrimitive>
  );
};
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = ({
  asChild,
  children,
  className,
  forceMount,
  ...props
}: PartProps<typeof CollapsiblePanel> & {
  /** Keeps the content in the page, hidden, while the collapsible stays closed. */
  forceMount?: true;
}) => {
  const slot = asChildProps({ asChild, children });

  return (
    <CollapsiblePanel
      className={cn(
        "[--radix-collapsible-content-height:var(--collapsible-panel-height)] [--radix-collapsible-content-width:var(--collapsible-panel-width)]",
        className,
      )}
      keepMounted={forceMount}
      render={withDataAttributes("div", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </CollapsiblePanel>
  );
};
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
