"use client";

import * as React from "react";

import {
  Select as SelectRoot,
  SelectContent as SelectContentPart,
  SelectGroup as SelectGroupPart,
  SelectGroupLabel as SelectGroupLabelPart,
  SelectItem as SelectItemPart,
  SelectItemIndicator,
  SelectSeparator as SelectSeparatorPart,
  SelectTrigger as SelectTriggerPart,
  SelectValue as SelectValuePart,
} from "@ui-sdk/react/select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import type { MaterialProps } from "../../../lib/material";
import {
  asChildProps,
  type DataAttributes,
  openState,
  Slot,
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

/** What `SelectContent` takes from Radix; `onFocusOutside` was never part of it. */
type SelectDismissHandlers = Omit<DismissHandlers, "onFocusOutside">;

/** Radix reads an empty string as "nothing selected"; ui-sdk reads `null`. */
const toSelection = (value: string | undefined) =>
  value === "" ? null : value;

type SelectProps = {
  autoComplete?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  defaultValue?: string;
  /** Radix-compatible: accepted, ui-sdk follows the document direction. */
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  form?: string;
  name?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string) => void;
  open?: boolean;
  required?: boolean;
  value?: string;
};

/** Holds the value and the open state. Renders no element. */
const Select = ({
  defaultValue,

  dir,
  onOpenChange,
  onValueChange,
  value,
  ...props
}: SelectProps) => {
  const dismiss = useDismissRoot((open) => {
    onOpenChange?.(open);
  });

  return (
    <DismissContext value={dismiss.ref}>
      <SelectRoot
        defaultValue={toSelection(defaultValue)}
        onOpenChange={dismiss.handleOpenChange}
        onValueChange={(next) => {
          onValueChange?.(next ?? "");
        }}
        value={toSelection(value)}
        {...props}
      />
    </DismissContext>
  );
};
Select.displayName = "Select";

type GroupProps = Omit<
  PlainClass<React.ComponentProps<typeof SelectGroupPart>>,
  "children" | "render"
> & {
  asChild?: boolean;
  children?: React.ReactNode;
};

const SelectGroup = ({ asChild, children, ...props }: GroupProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <SelectGroupPart render={slot.render} {...props}>
      {slot.children}
    </SelectGroupPart>
  );
};
SelectGroup.displayName = "SelectGroup";

type ValueProps = Omit<
  PlainClass<React.ComponentProps<typeof SelectValuePart>>,
  "children" | "render"
> & {
  asChild?: boolean;
  children?: React.ReactNode;
};

const SelectValue = ({
  asChild,
  children,
  placeholder,
  ...props
}: ValueProps) => {
  const slot = asChildProps({ asChild, children });
  const { children: content, render } = slot;

  return (
    <SelectValuePart placeholder={placeholder} render={render} {...props}>
      {content === undefined
        ? undefined
        : (state) => (state.placeholder ? placeholder : content)}
    </SelectValuePart>
  );
};
SelectValue.displayName = "SelectValue";

type TriggerProps = Omit<
  PlainClass<React.ComponentProps<typeof SelectTriggerPart>>,
  "children" | "render"
> & {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
};

const SelectTrigger = ({
  children,
  className,
  ref,
  ...props
}: TriggerProps) => (
  <SelectTriggerPart
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    ref={ref}
    render={withDataAttributes("button", openState)}
    {...props}
  >
    {children}
    <ChevronDown aria-hidden className="size-4 opacity-50" />
  </SelectTriggerPart>
);
SelectTrigger.displayName = "SelectTrigger";

/** The scrolling list inside the content, which the scroll buttons watch. */
const ViewportContext = React.createContext<HTMLElement | null>(null);

/** How far the pointer resting on a scroll button moves the list, per tick. */
const AUTO_SCROLL_STEP = 28;
const AUTO_SCROLL_INTERVAL = 50;

/**
 * Whether the list can still scroll `direction`, plus the pointer handlers
 * that scroll it while the pointer rests on the button.
 */
function useScrollButton(direction: "down" | "up") {
  const viewport = React.use(ViewportContext);
  const [visible, setVisible] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  React.useEffect(() => {
    if (!viewport) {
      return;
    }
    const update = () => {
      setVisible(
        direction === "up"
          ? viewport.scrollTop > 0
          : Math.ceil(viewport.scrollTop + viewport.clientHeight) <
              viewport.scrollHeight,
      );
    };
    update();
    viewport.addEventListener("scroll", update);
    const observer = new ResizeObserver(update);
    observer.observe(viewport);

    return () => {
      viewport.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [direction, viewport]);

  const stop = React.useCallback(() => {
    clearInterval(timer.current);
    timer.current = undefined;
  }, []);
  React.useEffect(() => stop, [stop]);

  const start = React.useCallback(() => {
    if (timer.current !== undefined || !viewport) {
      return;
    }
    timer.current = setInterval(() => {
      viewport.scrollTop +=
        direction === "up" ? -AUTO_SCROLL_STEP : AUTO_SCROLL_STEP;
    }, AUTO_SCROLL_INTERVAL);
  }, [direction, viewport]);

  return { start, stop, visible };
}

type ScrollButtonProps = React.ComponentPropsWithoutRef<"div"> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

const SCROLL_BUTTON_CLASS =
  "flex shrink-0 cursor-default items-center justify-center py-1";

const SelectScrollUpButton = ({
  asChild,
  className,
  ref,
  ...props
}: ScrollButtonProps) => {
  const { start, stop, visible } = useScrollButton("up");
  const Component = asChild ? Slot : "div";

  return visible ? (
    <Component
      aria-hidden
      className={cn(SCROLL_BUTTON_CLASS, className)}
      onPointerLeave={stop}
      onPointerMove={start}
      ref={ref}
      {...props}
    >
      {asChild ? undefined : <ChevronUp className="size-4" />}
    </Component>
  ) : null;
};
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton = ({
  asChild,
  className,
  ref,
  ...props
}: ScrollButtonProps) => {
  const { start, stop, visible } = useScrollButton("down");
  const Component = asChild ? Slot : "div";

  return visible ? (
    <Component
      aria-hidden
      className={cn(SCROLL_BUTTON_CLASS, className)}
      onPointerLeave={stop}
      onPointerMove={start}
      ref={ref}
      {...props}
    >
      {asChild ? undefined : <ChevronDown className="size-4" />}
    </Component>
  ) : null;
};
SelectScrollDownButton.displayName = "SelectScrollDownButton";

type ContentProps = MaterialProps &
  Omit<
    PlainClass<React.ComponentProps<typeof SelectContentPart>>,
    "children" | "render"
  > &
  SelectDismissHandlers & {
    asChild?: boolean;
    children?: React.ReactNode;
    /** Radix-compatible: accepted, ui-sdk always returns focus to the trigger. */
    onCloseAutoFocus?: (event: Event) => void;
    position?: "item-aligned" | "popper";
    ref?: React.Ref<HTMLDivElement>;
  };

const SelectContent = ({
  asChild,
  children,
  className,
  collisionPadding = 0,
  material = "glass",

  onCloseAutoFocus,
  onEscapeKeyDown,
  onInteractOutside,
  onPointerDownOutside,
  position = "popper",
  ref,
  sideOffset = 0,
  ...props
}: ContentProps) => {
  const slot = asChildProps({ asChild, children });
  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
  const popper = position === "popper";

  useRegisterDismissHandlers({
    onEscapeKeyDown,
    onInteractOutside,
    onPointerDownOutside,
  });

  return (
    <SelectContentPart
      alignItemWithTrigger={!popper}
      className={cn(
        "vllnt-glass-floating vllnt-glass-dense relative z-50 bg-transparent p-0 flex max-h-96 min-w-[8rem] flex-col overflow-hidden rounded-md border text-popover-foreground vllnt-radix-select motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        popper &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      collisionPadding={collisionPadding}
      data-material={material}
      ref={ref}
      render={withDataAttributes("div", openState, slot.render)}
      sideOffset={sideOffset}
      {...props}
    >
      <ViewportContext value={viewport}>
        <SelectScrollUpButton />
        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden p-1",
            popper &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
          ref={setViewport}
          role="presentation"
        >
          {slot.children}
        </div>
        <SelectScrollDownButton />
      </ViewportContext>
    </SelectContentPart>
  );
};
SelectContent.displayName = "SelectContent";

type LabelProps = Omit<
  PlainClass<React.ComponentProps<typeof SelectGroupLabelPart>>,
  "children" | "render"
> & {
  asChild?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
};

const SelectLabel = ({
  asChild,
  children,
  className,
  ref,
  ...props
}: LabelProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <SelectGroupLabelPart
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      ref={ref}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </SelectGroupLabelPart>
  );
};
SelectLabel.displayName = "SelectLabel";

const itemState = (state: { selected: boolean }): DataAttributes => ({
  "data-state": state.selected ? "checked" : "unchecked",
});

type ItemProps = Omit<
  PlainClass<React.ComponentProps<typeof SelectItemPart>>,
  "children" | "label" | "render" | "value"
> & {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
  /** The text the trigger shows and typing finds, when the children aren't plain text. */
  textValue?: string;
  value: string;
};

const SelectItem = ({
  children,
  className,
  ref,
  textValue,
  ...props
}: ItemProps) => (
  <SelectItemPart
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    label={textValue}
    ref={ref}
    render={withDataAttributes("div", itemState)}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <SelectItemIndicator>
        <Check className="size-4" />
      </SelectItemIndicator>
    </span>

    <span>{children}</span>
  </SelectItemPart>
);
SelectItem.displayName = "SelectItem";

type SeparatorProps = Omit<
  PlainClass<React.ComponentProps<typeof SelectSeparatorPart>>,
  "render"
> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

const SelectSeparator = ({
  asChild,
  children,
  className,
  ref,
  ...props
}: SeparatorProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <SelectSeparatorPart
      className={cn("-m-1 h-px bg-border", className)}
      ref={ref}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </SelectSeparatorPart>
  );
};
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
