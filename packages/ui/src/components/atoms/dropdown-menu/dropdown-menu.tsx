"use client";

import * as React from "react";

import { MenuTrigger as MenuTriggerPart } from "@ui-sdk/react/menu";

import type { AsChildProps, NarrowPartProps } from "../../../lib/ui-sdk";
import {
  asChildProps,
  openState,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import {
  createMenuParts,
  type MenuContentProps,
} from "../../../lib/ui-sdk-menu";

const {
  CheckboxItem: DropdownMenuCheckboxItem,
  Group: DropdownMenuGroup,
  Item: DropdownMenuItem,
  Label: DropdownMenuLabel,
  Popup,
  Portal: DropdownMenuPortal,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Root: DropdownMenu,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
} = createMenuParts("DropdownMenu", {
  check: <span className="text-xs">✓</span>,
  checkable:
    "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  chevron: <span className="ml-auto text-xs">›</span>,
  item: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  label: "px-2 py-1.5 text-sm font-semibold",
  labelledByTrigger: true,
  popup:
    "vllnt-glass-floating vllnt-glass-dense z-50 bg-transparent min-w-[8rem] overflow-hidden rounded-md border p-1 text-popover-foreground [--radix-dropdown-menu-content-available-height:var(--available-height)] [--radix-dropdown-menu-content-available-width:var(--available-width)] [--radix-dropdown-menu-content-transform-origin:var(--transform-origin)] [--radix-dropdown-menu-trigger-height:var(--anchor-height)] [--radix-dropdown-menu-trigger-width:var(--anchor-width)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  radio: <span className="text-xs">○</span>,
  shortcut: "ml-auto text-xs tracking-widest opacity-60",
  subTrigger:
    "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[highlighted]:bg-accent data-[state=open]:bg-accent",
});

type TriggerProps = AsChildProps &
  NarrowPartProps<React.ComponentProps<typeof MenuTriggerPart>> & {
    ref?: React.Ref<HTMLButtonElement>;
  };

const DropdownMenuTrigger = ({ asChild, children, ...props }: TriggerProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuTriggerPart
      render={withDataAttributes("button", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </MenuTriggerPart>
  );
};
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = ({
  align = "center",
  sideOffset = 4,
  ...props
}: MenuContentProps) => (
  <Popup align={align} sideOffset={sideOffset} {...props} />
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuSubContent = ({
  sideOffset = 0,
  ...props
}: MenuContentProps) => <Popup sideOffset={sideOffset} {...props} />;
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
