"use client";

import * as React from "react";

import {
  NavigationMenu as NavigationMenuRoot,
  NavigationMenuContent as NavigationMenuContentPart,
  NavigationMenuIndicator as NavigationMenuIndicatorPart,
  NavigationMenuItem as NavigationMenuItemPart,
  NavigationMenuLink as NavigationMenuLinkPart,
  NavigationMenuList as NavigationMenuListPart,
  NavigationMenuTrigger as NavigationMenuTriggerPart,
  NavigationMenuViewport as NavigationMenuViewportPart,
} from "@ui-sdk/react/navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import {
  asChildProps,
  type DataAttributes,
  openState,
  useElementRef,
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

type ChangeDetails = {
  cancel: () => void;
  canceled: boolean;
  event?: Event;
  reason: string;
};

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
 * Radix's dismissal callbacks, run from the root's `onValueChange`: the handler
 * gets the DOM event, and `preventDefault()` keeps the panel open.
 */
function runInteractions(
  interactions: Interactions,
  { cancel, event, reason }: ChangeDetails,
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

type RootState = {
  /** The root element, where the viewport lines up. */
  anchor: HTMLElement | null;
  /** Records whether the pressed link's `onSelect` called `preventDefault()`. */
  markLink: (prevented: boolean) => void;
  /** Hands a content's dismissal callbacks to the root; returns the undo. */
  register: (entry: ContentEntry) => () => void;
};

type ContentEntry = { element: HTMLElement | null; interactions: Interactions };

const RootContext = React.createContext<null | RootState>(null);

type RootProps = Omit<
  Narrow<React.ComponentProps<typeof NavigationMenuRoot>>,
  "defaultValue" | "onValueChange" | "value"
> & {
  defaultValue?: string;
  /** Milliseconds the pointer rests on a trigger before its panel opens. */
  delayDuration?: number;
  /** Radix-compatible: accepted, ui-sdk follows the document direction. */
  dir?: "ltr" | "rtl";
  /** Called with the open item's value, and `""` once no panel stays open. */
  onValueChange?: (value: string) => void;
  ref?: React.Ref<HTMLElement>;
  /** Radix-compatible: accepted, ui-sdk decides when a quick return skips the delay. */
  skipDelayDuration?: number;
  /** Value of the open item, `""` for none. */
  value?: string;
};

const toValue = (value: string | undefined) => (value === "" ? null : value);

/**
 * What the root keeps for its parts: the content that is open and its Radix
 * dismissal callbacks, and whether a pressed link asked to keep the menu open.
 */
function useRootState(
  anchor: HTMLElement | null,
  onValueChange?: (value: string) => void,
) {
  const entriesRef = React.useRef(new Set<ContentEntry>());
  const linkPreventedRef = React.useRef(false);
  const state = React.useMemo<RootState>(
    () => ({
      anchor,
      markLink(prevented) {
        linkPreventedRef.current = prevented;
      },
      register(entry) {
        entriesRef.current.add(entry);

        return () => {
          entriesRef.current.delete(entry);
        };
      },
    }),
    [anchor],
  );
  const handleValueChange = (
    next: null | string,
    details: ChangeDetails,
  ): void => {
    if (next === null) {
      if (details.reason === "link-press") {
        if (linkPreventedRef.current) {
          details.cancel();
        }
      } else {
        const open = [...entriesRef.current].find((entry) =>
          entry.element?.matches("[data-open]"),
        );
        runInteractions(open?.interactions ?? {}, details);
      }
    }
    linkPreventedRef.current = false;
    if (!details.canceled) {
      onValueChange?.(next ?? "");
    }
  };

  return { handleValueChange, state };
}

const NavigationMenu = ({
  children,
  className,
  defaultValue,
  delayDuration = 200,
  dir,
  onValueChange,
  ref,
  skipDelayDuration,
  value,
  ...props
}: RootProps) => {
  const [anchor, anchorRef] = useElementRef<HTMLElement>(ref);
  const { handleValueChange, state } = useRootState(anchor, onValueChange);

  return (
    <RootContext value={state}>
      <NavigationMenuRoot
        aria-label="Main"
        className={cn(
          "relative z-10 flex max-w-max flex-1 items-center justify-center",
          className,
        )}
        closeDelay={150}
        defaultValue={toValue(defaultValue)}
        delay={delayDuration}
        onValueChange={handleValueChange}
        ref={anchorRef}
        value={toValue(value)}
        {...props}
      >
        {children}
        <NavigationMenuViewport />
      </NavigationMenuRoot>
    </RootContext>
  );
};
NavigationMenu.displayName = "NavigationMenu";

type ListProps = AsChild &
  Narrow<React.ComponentProps<typeof NavigationMenuListPart>> & {
    ref?: React.Ref<HTMLUListElement>;
  };

const NavigationMenuList = ({
  asChild,
  children,
  className,
  ...props
}: ListProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <NavigationMenuListPart
      className={cn(
        "group flex flex-1 list-none items-center justify-center space-x-1",
        className,
      )}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </NavigationMenuListPart>
  );
};
NavigationMenuList.displayName = "NavigationMenuList";

type ItemProps = AsChild &
  Narrow<React.ComponentProps<typeof NavigationMenuItemPart>> & {
    ref?: React.Ref<HTMLLIElement>;
  };

const NavigationMenuItem = ({
  asChild,
  children,
  className,
  ...props
}: ItemProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <NavigationMenuItemPart
      className={className}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </NavigationMenuItemPart>
  );
};
NavigationMenuItem.displayName = "NavigationMenuItem";

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
);

type TriggerProps = AsChild &
  Narrow<React.ComponentProps<typeof NavigationMenuTriggerPart>> & {
    ref?: React.Ref<HTMLButtonElement>;
  };

const NavigationMenuTrigger = ({
  asChild,
  children,
  className,
  ...props
}: TriggerProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <NavigationMenuTriggerPart
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      render={withDataAttributes("button", openState, slot.render)}
      {...props}
    >
      {slot.children}{" "}
      <ChevronDown
        aria-hidden="true"
        className="relative top-[1px] ml-1 size-3 transition duration-200 group-data-[state=open]:rotate-180"
      />
    </NavigationMenuTriggerPart>
  );
};
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

const contentState = (state: { open: boolean }): DataAttributes =>
  openState(state);

type ContentProps = AsChild &
  Interactions &
  Narrow<
    Omit<
      React.ComponentProps<typeof NavigationMenuContentPart>,
      "hiddenUntilFound" | "keepMounted"
    >
  > & {
    /** Keeps the content in the page while its item stays closed. */
    forceMount?: boolean;
    ref?: React.Ref<HTMLDivElement>;
  };

const NavigationMenuContent = ({
  asChild,
  children,
  className,
  forceMount,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onPointerDownOutside,
  ref,
  ...props
}: ContentProps) => {
  const slot = asChildProps({ asChild, children });
  const root = React.use(RootContext);
  const [element, elementRef] = useElementRef(ref);
  React.useEffect(
    () =>
      root?.register({
        element,
        interactions: {
          onEscapeKeyDown,
          onFocusOutside,
          onInteractOutside,
          onPointerDownOutside,
        },
      }),
    [
      element,
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
      root,
    ],
  );

  return (
    <NavigationMenuContentPart
      className={cn(
        "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
        className,
      )}
      keepMounted={forceMount}
      ref={elementRef}
      render={withDataAttributes("div", contentState, slot.render)}
      {...props}
    >
      {slot.children}
    </NavigationMenuContentPart>
  );
};
NavigationMenuContent.displayName = "NavigationMenuContent";

type LinkProps = AsChild &
  Omit<
    Narrow<React.ComponentProps<typeof NavigationMenuLinkPart>>,
    "current" | "onSelect"
  > & {
    /** Marks the link of the current page. */
    active?: boolean;
    /** Runs on a press of the link; `preventDefault()` keeps the menu open. */
    onSelect?: (event: Event) => void;
    ref?: React.Ref<HTMLAnchorElement>;
  };

const NavigationMenuLink = ({
  active,
  asChild,
  children,
  onClick,
  onSelect,
  ...props
}: LinkProps) => {
  const slot = asChildProps({ asChild, children });
  const root = React.use(RootContext);
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const selection = new Event("navigationMenu.linkSelect", {
      bubbles: true,
      cancelable: true,
    });
    onSelect?.(selection);
    root?.markLink(selection.defaultPrevented);
  };

  return (
    <NavigationMenuLinkPart
      current={active}
      onClick={handleClick}
      render={withDataAttributes(
        "a",
        () => ({ "data-active": active ? "" : undefined }),
        slot.render,
      )}
      {...props}
    >
      {slot.children}
    </NavigationMenuLinkPart>
  );
};
NavigationMenuLink.displayName = "NavigationMenuLink";

type ViewportProps = AsChild &
  Narrow<React.ComponentProps<typeof NavigationMenuViewportPart>> & {
    /** Radix-compatible: accepted, ui-sdk unmounts the viewport while closed. */
    forceMount?: true;
    ref?: React.Ref<HTMLDivElement>;
  };

const NavigationMenuViewport = ({
  align = "start",
  asChild,
  children,
  className,
  collisionPadding = 0,
  forceMount: _forceMount,
  side = "bottom",
  sideOffset = 6,
  ...props
}: ViewportProps) => {
  const slot = asChildProps({ asChild, children });
  const root = React.use(RootContext);

  return (
    <NavigationMenuViewportPart
      align={align}
      anchor={root?.anchor}
      className={cn(
        "origin-top-center h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden p-0 rounded-md border bg-popover text-popover-foreground shadow-lg [--radix-navigation-menu-viewport-height:calc(var(--viewport-height)_-_2px)] [--radix-navigation-menu-viewport-width:calc(var(--viewport-width)_-_2px)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className,
      )}
      collisionPadding={collisionPadding}
      render={withDataAttributes("div", openState, slot.render)}
      side={side}
      sideOffset={sideOffset}
      {...props}
    >
      {slot.children}
    </NavigationMenuViewportPart>
  );
};
NavigationMenuViewport.displayName = "NavigationMenuViewport";

const indicatorState = (state: { open: boolean }): DataAttributes => ({
  "data-state": state.open ? "visible" : "hidden",
});

type IndicatorProps = AsChild &
  Narrow<React.ComponentProps<typeof NavigationMenuIndicatorPart>> & {
    /** Radix-compatible: accepted, ui-sdk keeps the indicator mounted. */
    forceMount?: true;
    ref?: React.Ref<HTMLDivElement>;
  };

const NavigationMenuIndicator = ({
  asChild,
  children,
  className,
  forceMount: _forceMount,
  ...props
}: IndicatorProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <NavigationMenuIndicatorPart
      className={cn(
        "absolute left-[var(--active-item-left)] top-full z-[1] flex h-1.5 w-[var(--active-item-width)] items-end justify-center overflow-hidden data-[state=hidden]:opacity-0 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
        className,
      )}
      render={withDataAttributes("div", indicatorState, slot.render)}
      {...props}
    >
      <div className="relative top-[60%] size-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuIndicatorPart>
  );
};
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
};
