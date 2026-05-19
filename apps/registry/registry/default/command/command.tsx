"use client";

import * as React from "react";

import type * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Dialog, DialogContent, DialogTitle } from "@vllnt/ui";

const Command = ({
  className,
  ref: reference,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive> &
  React.RefAttributes<React.ComponentRef<typeof CommandPrimitive>>) => (
  <CommandPrimitive
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className,
    )}
    ref={reference}
    {...props}
  />
);
Command.displayName = CommandPrimitive.displayName;

type CommandDialogProps = {} & React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Root
>;

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <DialogTitle className="sr-only">Command Menu</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = ({
  className,
  ref: reference,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> &
  React.RefAttributes<React.ComponentRef<typeof CommandPrimitive.Input>>) => (
  // eslint-disable-next-line react/no-unknown-property
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 size-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={reference}
      {...props}
    />
  </div>
);
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = ({
  className,
  ref: reference,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> &
  React.RefAttributes<React.ComponentRef<typeof CommandPrimitive.List>>) => (
  <CommandPrimitive.List
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    ref={reference}
    {...props}
  />
);
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = ({
  ref: reference,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> &
  React.RefAttributes<React.ComponentRef<typeof CommandPrimitive.Empty>>) => (
  <CommandPrimitive.Empty
    className="py-6 text-center text-sm"
    ref={reference}
    {...props}
  />
);
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = ({
  className,
  ref: reference,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> &
  React.RefAttributes<React.ComponentRef<typeof CommandPrimitive.Group>>) => (
  <CommandPrimitive.Group
    className={cn(
      "overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className,
    )}
    ref={reference}
    {...props}
  />
);
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = ({
  className,
  ref: reference,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> &
  React.RefAttributes<
    React.ComponentRef<typeof CommandPrimitive.Separator>
  >) => (
  <CommandPrimitive.Separator
    className={cn("-mx-1 h-px bg-border", className)}
    ref={reference}
    {...props}
  />
);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = ({
  className,
  disabled,
  ref: reference,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> &
  React.RefAttributes<React.ComponentRef<typeof CommandPrimitive.Item>>) => (
  <CommandPrimitive.Item
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:opacity-50",
      disabled && "pointer-events-none",
      className,
    )}
    disabled={disabled}
    ref={reference}
    {...props}
  />
);
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
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
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
