"use client";

import * as React from "react";

import {
  Menu as MenuRoot,
  MenuTrigger as MenuTriggerPart,
} from "@ui-sdk/react/menu";
import { Menubar as MenubarRoot } from "@ui-sdk/react/menubar";

import {
  asChildProps,
  openState,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import {
  type AsChild,
  ContentContext,
  createMenuParts,
  type MenuContentProps,
  type Narrow,
  useContentOptions,
} from "../../../lib/ui-sdk-menu";
import { cn } from "../../../lib/utils";

const {
  CheckboxItem: MenubarCheckboxItem,
  Group: MenubarGroup,
  Item: MenubarItem,
  Label: MenubarLabel,
  Popup,
  Portal: MenubarPortal,
  RadioGroup: MenubarRadioGroup,
  RadioItem: MenubarRadioItem,
  Separator: MenubarSeparator,
  Shortcut: MenubarShortcut,
  Sub: MenubarSub,
  SubTrigger: MenubarSubTrigger,
} = createMenuParts("Menubar", {
  label: "px-2 py-1.5 text-sm font-semibold",
  labelledByTrigger: true,
  popup:
    "vllnt-glass-floating vllnt-glass-dense z-50 bg-transparent overflow-hidden rounded-md border p-1 text-popover-foreground [--radix-menubar-content-available-height:var(--available-height)] [--radix-menubar-content-available-width:var(--available-width)] [--radix-menubar-content-transform-origin:var(--transform-origin)] [--radix-menubar-trigger-height:var(--anchor-height)] [--radix-menubar-trigger-width:var(--anchor-width)] data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
});

/** What the bar tells its menus: which one is open, and who hears changes. */
type BarState = {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

const BarContext = React.createContext<BarState>({});

type MenubarProps = Narrow<React.ComponentProps<typeof MenubarRoot>> & {
  /** Value of the menu that starts open. */
  defaultValue?: string;
  /** Radix-compatible: accepted, ui-sdk follows the document direction. */
  dir?: "ltr" | "rtl";
  /** Called with the value of the open menu, and `""` once none is open. */
  onValueChange?: (value: string) => void;
  ref?: React.Ref<HTMLDivElement>;
  /** Value of the open menu, `""` for none. Leave out to let the bar decide. */
  value?: string;
};

const Menubar = ({
  className,
  defaultValue,
  dir,
  modal = false,
  onValueChange,
  value,
  ...props
}: MenubarProps) => {
  const state = React.useMemo(
    () => ({ defaultValue, onValueChange, value }),
    [defaultValue, onValueChange, value],
  );

  return (
    <BarContext value={state}>
      <MenubarRoot
        className={cn(
          "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
          className,
        )}
        modal={modal}
        {...props}
      />
    </BarContext>
  );
};
Menubar.displayName = "Menubar";

type MenubarMenuProps = Omit<
  React.ComponentProps<typeof MenuRoot>,
  "defaultOpen" | "modal" | "onOpenChange" | "open"
> & {
  /** Names the menu in the bar's `value`. */
  value?: string;
};

/** Holds the open state of one menu in the bar. Renders no element. */
const MenubarMenu = ({ value, ...props }: MenubarMenuProps) => {
  const generated = React.useId();
  const id = value ?? generated;
  const bar = React.use(BarContext);
  const options = useContentOptions((open, details) => {
    if (open) {
      bar.onValueChange?.(id);
    } else if (details.reason !== "submenu-switch") {
      // Another menu taking over reports itself when it opens.
      bar.onValueChange?.("");
    }
  });

  return (
    <ContentContext value={options.register}>
      <MenuRoot
        defaultOpen={
          bar.defaultValue === undefined ? undefined : bar.defaultValue === id
        }
        loop={options.loop}
        onOpenChange={options.handleOpenChange}
        open={bar.value === undefined ? undefined : bar.value === id}
        {...props}
      />
    </ContentContext>
  );
};
MenubarMenu.displayName = "MenubarMenu";

type TriggerProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuTriggerPart>> & {
    ref?: React.Ref<HTMLButtonElement>;
  };

const MenubarTrigger = ({
  asChild,
  children,
  className,
  ...props
}: TriggerProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuTriggerPart
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        className,
      )}
      render={withDataAttributes("button", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </MenuTriggerPart>
  );
};
MenubarTrigger.displayName = "MenubarTrigger";

const MenubarContent = ({
  align = "start",
  alignOffset = -4,
  className,
  sideOffset = 8,
  ...props
}: MenuContentProps) => (
  <Popup
    align={align}
    alignOffset={alignOffset}
    className={cn("min-w-[12rem]", className)}
    sideOffset={sideOffset}
    {...props}
  />
);
MenubarContent.displayName = "MenubarContent";

const MenubarSubContent = ({
  className,
  sideOffset = 0,
  ...props
}: MenuContentProps) => (
  <Popup
    className={cn("min-w-[8rem] data-[state=closed]:animate-out", className)}
    sideOffset={sideOffset}
    {...props}
  />
);
MenubarSubContent.displayName = "MenubarSubContent";

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
