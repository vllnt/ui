"use client";

import * as React from "react";

import {
  HoverCard as HoverCardRoot,
  HoverCardContent as HoverCardContentPart,
  HoverCardTrigger as HoverCardTriggerPart,
  type HoverCardTriggerState,
} from "@ui-sdk/react/hover-card";
import { renderElement, type RenderProp } from "@ui-sdk/react/primitive";

import type { MaterialProps } from "../../../lib/material";
import { named } from "../../../lib/named";
import {
  asChildProps,
  openState,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import {
  DismissContext,
  type DismissHandlers,
  useDismissRoot,
  useRegisterDismissHandlers,
} from "../../../lib/ui-sdk-dismiss";
import { cn } from "../../../lib/utils";

/** A ui-sdk part's props with a plain string `className`, as Radix had. */
type PlainClass<Props> = Omit<Props, "className"> & { className?: string };

/** Radix's default: how long the pointer rests on the trigger before it opens. */
const DEFAULT_OPEN_DELAY = 700;

type HoverCardProps = Omit<
  React.ComponentProps<typeof HoverCardRoot>,
  "delay"
> & {
  /** Milliseconds the pointer rests on the trigger before the card opens. */
  openDelay?: number;
};

/** The content's id, so the trigger can describe itself with the open card. */
const ContentIdContext = React.createContext<string | undefined>(undefined);

const HoverCard = /* @__PURE__ */ named(
  "HoverCard",
  ({
    onOpenChange,
    openDelay = DEFAULT_OPEN_DELAY,
    ...props
  }: HoverCardProps) => {
    const contentId = React.useId();
    const dismiss = useDismissRoot(onOpenChange);

    return (
      <ContentIdContext value={contentId}>
        <DismissContext value={dismiss.ref}>
          <HoverCardRoot
            delay={openDelay}
            onOpenChange={dismiss.handleOpenChange}
            {...props}
          />
        </DismissContext>
      </ContentIdContext>
    );
  },
);

type TriggerProps = Omit<
  PlainClass<React.ComponentProps<typeof HoverCardTriggerPart>>,
  "render"
> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLAnchorElement>;
};

/**
 * The render function of the trigger. While the card is open it describes the
 * link (`aria-describedby`), so a screen reader announces the preview with it.
 */
function triggerRender(
  contentId: string | undefined,
  render?: RenderProp<HoverCardTriggerState>,
): RenderProp<HoverCardTriggerState> {
  return (props, state) =>
    renderElement(
      "a",
      {
        ...props,
        ...openState(state),
        "aria-describedby":
          [props["aria-describedby"], state.open && contentId]
            .filter(Boolean)
            .join(" ") || undefined,
      },
      render,
      state,
    );
}

const HoverCardTrigger = /* @__PURE__ */ named(
  "HoverCardTrigger",
  ({ asChild, children, ...props }: TriggerProps) => {
    const contentId = React.use(ContentIdContext);
    const slot = asChildProps({ asChild, children });

    return (
      <HoverCardTriggerPart
        render={triggerRender(contentId, slot.render)}
        {...props}
      >
        {slot.children}
      </HoverCardTriggerPart>
    );
  },
);

type ContentProps = DismissHandlers &
  MaterialProps &
  Omit<
    PlainClass<React.ComponentProps<typeof HoverCardContentPart>>,
    "render"
  > & {
    asChild?: boolean;
    /** Keeps the card in the page while closed, like Radix's `forceMount`. */
    forceMount?: boolean;
    ref?: React.Ref<HTMLDivElement>;
  };

const HoverCardContent = /* @__PURE__ */ named(
  "HoverCardContent",
  ({
    align = "center",
    asChild,
    children,
    className,
    collisionPadding = 0,
    forceMount,
    material = "glass",
    onEscapeKeyDown,
    onFocusOutside,
    onInteractOutside,
    onPointerDownOutside,
    ref,
    sideOffset = 4,
    ...props
  }: ContentProps) => {
    const contentId = React.use(ContentIdContext);
    const slot = asChildProps({ asChild, children });
    useRegisterDismissHandlers({
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
    });

    return (
      <HoverCardContentPart
        align={align}
        className={cn(
          "vllnt-glass-floating vllnt-glass-dense z-50 bg-transparent w-64 rounded-md border p-4 text-popover-foreground outline-none vllnt-radix-hover-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        collisionPadding={collisionPadding}
        data-material={material}
        id={contentId}
        keepMounted={forceMount}
        ref={ref}
        render={withDataAttributes("div", openState, slot.render)}
        sideOffset={sideOffset}
        {...props}
      >
        {slot.children}
      </HoverCardContentPart>
    );
  },
);

export { HoverCard, HoverCardContent, HoverCardTrigger };
