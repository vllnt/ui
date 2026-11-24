"use client";

import * as React from "react";

import { MenuContextTrigger as MenuContextTriggerPart } from "@ui-sdk/react/menu";

import {
  asChildProps,
  openState,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import {
  type AsChild,
  createMenuParts,
  type MenuContentProps,
  type Narrow,
} from "../../../lib/ui-sdk-menu";
import { cn } from "../../../lib/utils";

const {
  CheckboxItem: ContextMenuCheckboxItem,
  Group: ContextMenuGroup,
  Item: ContextMenuItem,
  Label: ContextMenuLabel,
  Popup,
  Portal: ContextMenuPortal,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem,
  Root: ContextMenu,
  Separator: ContextMenuSeparator,
  Shortcut: ContextMenuShortcut,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
} = createMenuParts("ContextMenu", {
  popup:
    "vllnt-glass-floating vllnt-glass-dense z-50 bg-transparent min-w-[8rem] overflow-hidden rounded-md border p-1 text-popover-foreground [--radix-context-menu-content-available-height:var(--available-height)] [--radix-context-menu-content-available-width:var(--available-width)] [--radix-context-menu-content-transform-origin:var(--transform-origin)] [--radix-context-menu-trigger-height:var(--anchor-height)] [--radix-context-menu-trigger-width:var(--anchor-width)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
});

type TriggerProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuContextTriggerPart>> & {
    ref?: React.Ref<HTMLSpanElement>;
  };

/**
 * Region that opens the menu on right-click. Keyboard users open it with
 * Shift+F10 or the ContextMenu key while the region has focus, so make the
 * region focusable (`tabIndex={0}`) with a visible focus style, or offer the
 * same actions through another control (WAI-ARIA APG menu pattern).
 */
const ContextMenuTrigger = ({ asChild, children, ...props }: TriggerProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuContextTriggerPart
      render={withDataAttributes("span", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </MenuContextTriggerPart>
  );
};
ContextMenuTrigger.displayName = "ContextMenuTrigger";

const ContextMenuContent = ({
  align = "start",
  className,
  side = "right",
  sideOffset = 2,
  ...props
}: MenuContentProps) => (
  <Popup
    align={align}
    className={cn("animate-in fade-in-80", className)}
    side={side}
    sideOffset={sideOffset}
    {...props}
  />
);
ContextMenuContent.displayName = "ContextMenuContent";

const ContextMenuSubContent = ({
  sideOffset = 0,
  ...props
}: MenuContentProps) => <Popup sideOffset={sideOffset} {...props} />;
ContextMenuSubContent.displayName = "ContextMenuSubContent";

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
