"use client";

import * as React from "react";

import {
  Menu as MenuRoot,
  MenuCheckboxItem as MenuCheckboxItemPart,
  MenuContent as MenuContentPart,
  MenuGroup as MenuGroupPart,
  MenuItem as MenuItemPart,
  MenuItemIndicator,
  MenuRadioGroup as MenuRadioGroupPart,
  MenuRadioItem as MenuRadioItemPart,
  MenuSub as MenuSubRoot,
  MenuSubTrigger as MenuSubTriggerPart,
  MenuTrigger as MenuTriggerPart,
} from "@ui-sdk/react/menu";

import type { MaterialProps } from "../../../lib/material";
import {
  asChildProps,
  checkedState,
  closeAutoFocus,
  type DataAttributes,
  openState,
  Slot,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

/** A ui-sdk part's props with a plain string `className`, as Radix had. */
type Narrow<Props> = Omit<Props, "children" | "className" | "render"> & {
  children?: React.ReactNode;
  className?: string;
};

/** Radix's `asChild`: render the single child as the part's element. */
type AsChild = { asChild?: boolean };

type Interactions = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
  onPointerDownOutside?: (event: Event) => void;
};

type ContentOptions = { interactions: Interactions; loop?: boolean };

type OpenChangeDetails = {
  cancel: () => void;
  canceled: boolean;
  event?: Event;
  reason: string;
};

/** How a menu's content hands what Radix put on the content to its root. */
const ContentContext = React.createContext<
  ((options: ContentOptions) => void) | null
>(null);

/**
 * Runs Radix-style `handlers` on `event` and tells whether one of them called
 * `preventDefault()`. ui-sdk calls it on the event itself first, so
 * `defaultPrevented` cannot tell.
 */
function callPreventDefault<Handled extends Event>(
  event: Handled,
  handlers: (((event: Handled) => void) | undefined)[],
): boolean {
  let prevented = false;
  const watched = new Proxy(event, {
    get(target, key) {
      if (key === "preventDefault") {
        return () => {
          prevented = true;
          target.preventDefault();
        };
      }
      const value: unknown = Reflect.get(target, key);

      return typeof value === "function"
        ? (value as (...arguments_: unknown[]) => unknown).bind(target)
        : value;
    },
  });
  handlers.forEach((handler) => handler?.(watched));

  return prevented;
}

/**
 * Radix's dismissal callbacks, run from the root's `onOpenChange`: the handler
 * gets the DOM event, and `preventDefault()` keeps the menu open.
 */
function runInteractions(
  interactions: Interactions,
  { cancel, event, reason }: OpenChangeDetails,
): void {
  if (!event) {
    return;
  }
  const handlers = {
    "escape-key": [interactions.onEscapeKeyDown],
    "focus-out": [interactions.onFocusOutside, interactions.onInteractOutside],
    "outside-press": [
      interactions.onPointerDownOutside,
      interactions.onInteractOutside,
    ],
  }[reason as "escape-key" | "focus-out" | "outside-press"] as
    | ((event: Event) => void)[]
    | undefined;
  if (handlers && callPreventDefault(event, handlers)) {
    cancel();
  }
}

/**
 * Radix puts `loop` and the dismissal callbacks on the content, ui-sdk on the
 * root: the root keeps what its content reports, and applies it.
 */
function useContentOptions(onOpenChange?: (open: boolean) => void) {
  const interactionsRef = React.useRef<Interactions>({});
  const [loop, setLoop] = React.useState<boolean>();
  const register = React.useCallback((options: ContentOptions) => {
    interactionsRef.current = options.interactions;
    setLoop(options.loop);
  }, []);

  return {
    handleOpenChange: (open: boolean, details: OpenChangeDetails) => {
      if (!open) {
        runInteractions(interactionsRef.current, details);
      }
      if (!details.canceled) {
        onOpenChange?.(open);
      }
    },
    loop,
    register,
  };
}

type DropdownMenuProps = Omit<
  React.ComponentProps<typeof MenuRoot>,
  "modal" | "onOpenChange"
> & {
  /** Radix-compatible: accepted, ui-sdk follows the document direction. */
  dir?: "ltr" | "rtl";
  /** Whether the menu locks the rest of the page while open. */
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Holds the open state. Renders no element. */
const DropdownMenu = ({
  dir,
  modal = true,
  onOpenChange,
  ...props
}: DropdownMenuProps) => {
  const options = useContentOptions(onOpenChange);

  return (
    <ContentContext value={options.register}>
      <MenuRoot
        loop={options.loop}
        modal={modal}
        onOpenChange={options.handleOpenChange}
        {...props}
      />
    </ContentContext>
  );
};
DropdownMenu.displayName = "DropdownMenu";

type TriggerProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuTriggerPart>> & {
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

type GroupProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuGroupPart>> & {
    ref?: React.Ref<HTMLDivElement>;
  };

const DropdownMenuGroup = ({ asChild, children, ...props }: GroupProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuGroupPart render={slot.render} {...props}>
      {slot.children}
    </MenuGroupPart>
  );
};
DropdownMenuGroup.displayName = "DropdownMenuGroup";

type PortalProps = {
  children?: React.ReactNode;
  /** Radix-compatible: accepted, ui-sdk renders the popup in the top layer. */
  container?: unknown;
  /** Radix-compatible: accepted, use `forceMount` on the content. */
  forceMount?: true;
};

/** Renders its children. Radix needed a portal, ui-sdk popups use the top layer. */
const DropdownMenuPortal = ({ children }: PortalProps) => children;
DropdownMenuPortal.displayName = "DropdownMenuPortal";

type SubProps = Omit<
  React.ComponentProps<typeof MenuSubRoot>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void;
};

/** Holds the open state of a submenu. Renders no element. */
const DropdownMenuSub = ({ onOpenChange, ...props }: SubProps) => {
  const options = useContentOptions(onOpenChange);

  return (
    <ContentContext value={options.register}>
      <MenuSubRoot
        loop={options.loop}
        onOpenChange={options.handleOpenChange}
        {...props}
      />
    </ContentContext>
  );
};
DropdownMenuSub.displayName = "DropdownMenuSub";

const contentState = (state: { open: boolean }): DataAttributes => ({
  "data-orientation": "vertical",
  ...openState(state),
});

type ContentProps = AsChild &
  Interactions &
  MaterialProps &
  Narrow<Omit<React.ComponentProps<typeof MenuContentPart>, "keepMounted">> & {
    /** Keeps the content in the page while the menu stays closed. */
    forceMount?: boolean;
    /** Whether arrow keys wrap from the last item to the first. */
    loop?: boolean;
    onCloseAutoFocus?: (event: Event) => void;
    ref?: React.Ref<HTMLDivElement>;
  };

const POPUP_CLASS =
  "vllnt-glass-floating vllnt-glass-dense z-50 bg-transparent min-w-[8rem] overflow-hidden rounded-md border p-1 text-popover-foreground [--radix-dropdown-menu-content-available-height:var(--available-height)] [--radix-dropdown-menu-content-available-width:var(--available-width)] [--radix-dropdown-menu-content-transform-origin:var(--transform-origin)] [--radix-dropdown-menu-trigger-height:var(--anchor-height)] [--radix-dropdown-menu-trigger-width:var(--anchor-width)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";

/** The popup of a menu or submenu, with what Radix put on the content. */
const MenuPopup = ({
  asChild,
  children,
  className,
  collisionPadding = 0,
  finalFocus,
  forceMount,
  loop = false,
  material = "glass",
  onCloseAutoFocus,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onPointerDownOutside,
  ...props
}: ContentProps) => {
  const slot = asChildProps({ asChild, children });
  const register = React.use(ContentContext);
  React.useEffect(() => {
    register?.({
      interactions: {
        onEscapeKeyDown,
        onFocusOutside,
        onInteractOutside,
        onPointerDownOutside,
      },
      loop,
    });
  });

  return (
    <MenuContentPart
      className={cn(POPUP_CLASS, className)}
      collisionPadding={collisionPadding}
      data-material={material}
      finalFocus={finalFocus ?? closeAutoFocus(onCloseAutoFocus)}
      keepMounted={forceMount}
      render={withDataAttributes("div", contentState, slot.render)}
      {...props}
    >
      {slot.children}
    </MenuContentPart>
  );
};

const DropdownMenuContent = ({
  align = "center",
  sideOffset = 4,
  ...props
}: ContentProps) => (
  <MenuPopup align={align} sideOffset={sideOffset} {...props} />
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuSubContent = ({ sideOffset = 0, ...props }: ContentProps) => (
  <MenuPopup sideOffset={sideOffset} {...props} />
);
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

type SubTriggerProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuSubTriggerPart>> & {
    inset?: boolean;
    ref?: React.Ref<HTMLDivElement>;
  };

const DropdownMenuSubTrigger = ({
  asChild,
  children,
  className,
  inset,
  ...props
}: SubTriggerProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuSubTriggerPart
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[highlighted]:bg-accent data-[state=open]:bg-accent",
        inset && "pl-8",
        className,
      )}
      render={withDataAttributes("div", openState, slot.render)}
      {...props}
    >
      {slot.children}
      <span className="ml-auto text-xs">›</span>
    </MenuSubTriggerPart>
  );
};
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

type ItemProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuItemPart>> & {
    inset?: boolean;
    ref?: React.Ref<HTMLDivElement>;
    /** The text typeahead matches, when the children aren't plain text. */
    textValue?: string;
  };

const DropdownMenuItem = ({
  asChild,
  children,
  className,
  inset,
  textValue,
  ...props
}: ItemProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuItemPart
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      label={textValue}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </MenuItemPart>
  );
};
DropdownMenuItem.displayName = "DropdownMenuItem";

const CHECKABLE_ITEM_CLASS =
  "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

type CheckboxItemProps = Narrow<
  Omit<
    React.ComponentProps<typeof MenuCheckboxItemPart>,
    "checked" | "onSelect" | "value"
  >
> & {
  checked?: "indeterminate" | boolean;
  ref?: React.Ref<HTMLDivElement>;
  /** The text typeahead matches, when the children aren't plain text. */
  textValue?: string;
};

const DropdownMenuCheckboxItem = ({
  checked,
  children,
  className,
  closeOnSelect = true,
  textValue,
  ...props
}: CheckboxItemProps) => {
  const value = React.useId();
  const indeterminate = checked === "indeterminate";

  return (
    <MenuCheckboxItemPart
      checked={indeterminate ? false : checked}
      className={cn(CHECKABLE_ITEM_CLASS, className)}
      closeOnSelect={closeOnSelect}
      label={textValue}
      render={withDataAttributes("div", (state: { checked: boolean }) =>
        checkedState({ ...state, indeterminate }),
      )}
      value={value}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <MenuItemIndicator keepMounted={indeterminate}>
          <span className="text-xs">✓</span>
        </MenuItemIndicator>
      </span>
      {children}
    </MenuCheckboxItemPart>
  );
};
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

type RadioGroupProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuRadioGroupPart>> & {
    ref?: React.Ref<HTMLDivElement>;
  };

const DropdownMenuRadioGroup = ({
  asChild,
  children,
  ...props
}: RadioGroupProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuRadioGroupPart render={slot.render} {...props}>
      {slot.children}
    </MenuRadioGroupPart>
  );
};
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup";

type RadioItemProps = Narrow<
  Omit<React.ComponentProps<typeof MenuRadioItemPart>, "onSelect">
> & {
  ref?: React.Ref<HTMLDivElement>;
  /** The text typeahead matches, when the children aren't plain text. */
  textValue?: string;
};

const DropdownMenuRadioItem = ({
  children,
  className,
  closeOnSelect = true,
  textValue,
  ...props
}: RadioItemProps) => (
  <MenuRadioItemPart
    className={cn(CHECKABLE_ITEM_CLASS, className)}
    closeOnSelect={closeOnSelect}
    label={textValue}
    render={withDataAttributes("div", checkedState)}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <MenuItemIndicator>
        <span className="text-xs">○</span>
      </MenuItemIndicator>
    </span>
    {children}
  </MenuRadioItemPart>
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

type LabelProps = React.ComponentPropsWithoutRef<"div"> & {
  asChild?: boolean;
  inset?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

/** A heading inside the menu. Like Radix's, a plain element. */
const DropdownMenuLabel = ({
  asChild,
  className,
  inset,
  ref,
  ...props
}: LabelProps) => {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};
DropdownMenuLabel.displayName = "DropdownMenuLabel";

type SeparatorProps = React.ComponentPropsWithoutRef<"div"> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

/** A rule between items. Like Radix's, a plain element. */
const DropdownMenuSeparator = ({
  asChild,
  className,
  ref,
  ...props
}: SeparatorProps) => {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      aria-orientation="horizontal"
      className={cn("-m-1 h-px bg-border", className)}
      ref={ref}
      role="separator"
      {...props}
    />
  );
};
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

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
