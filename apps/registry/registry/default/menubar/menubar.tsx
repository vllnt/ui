"use client";

import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@vllnt/ui";

const MenubarMenu: typeof MenubarPrimitive.Menu = MenubarPrimitive.Menu;

const MenubarGroup: typeof MenubarPrimitive.Group = MenubarPrimitive.Group;

const MenubarPortal: typeof MenubarPrimitive.Portal = MenubarPrimitive.Portal;

const MenubarSub: typeof MenubarPrimitive.Sub = MenubarPrimitive.Sub;

const MenubarRadioGroup: typeof MenubarPrimitive.RadioGroup =
  MenubarPrimitive.RadioGroup;

const Menubar = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.Root>>;
}) => (
  <MenubarPrimitive.Root
    className={cn(
      "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
      className,
    )}
    ref={ref}
    {...props}
  />
);
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger> & {
  ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.Trigger>>;
}) => (
  <MenubarPrimitive.Trigger
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className,
    )}
    ref={ref}
    {...props}
  />
);
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = ({
  children,
  className,
  inset,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean;
  ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.SubTrigger>>;
}) => (
  <MenubarPrimitive.SubTrigger
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    ref={ref}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto size-4" />
  </MenubarPrimitive.SubTrigger>
);
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent> & {
  ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.SubContent>>;
}) => (
  <MenubarPrimitive.SubContent
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    ref={ref}
    {...props}
  />
);
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = ({
  align = "start",
  alignOffset = -4,
  className,
  ref,
  sideOffset = 8,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> & {
  ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.Content>>;
}) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      align={align}
      alignOffset={alignOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      ref={ref}
      sideOffset={sideOffset}
      {...props}
    />
  </MenubarPrimitive.Portal>
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = ({
  className,
  inset,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
  ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.Item>>;
}) => (
  <MenubarPrimitive.Item
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    ref={ref}
    {...props}
  />
);
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = ({
  checked,
  children,
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem> & {
  ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.CheckboxItem>>;
}) => (
  <MenubarPrimitive.CheckboxItem
    checked={checked}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="size-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
);
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = ({
  children,
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem> & {
  ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.RadioItem>>;
}) => (
  <MenubarPrimitive.RadioItem
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="size-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
);
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = ({
  className,
  inset,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
  inset?: boolean;
  ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.Label>>;
}) => (
  <MenubarPrimitive.Label
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className,
    )}
    ref={ref}
    {...props}
  />
);
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator> & {
  ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.Separator>>;
}) => (
  <MenubarPrimitive.Separator
    className={cn("-m-1 h-px bg-muted", className)}
    ref={ref}
    {...props}
  />
);
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
};
MenubarShortcut.displayName = "MenubarShortcut";

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
