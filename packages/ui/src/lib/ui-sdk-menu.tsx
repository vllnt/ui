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
} from "@ui-sdk/react/menu";
import { renderElement } from "@ui-sdk/react/primitive";
import { Check, ChevronRight, Circle } from "lucide-react";

import type { MaterialProps } from "./material";
import {
  asChildProps,
  checkedState,
  closeAutoFocus,
  type DataAttributes,
  openState,
  Slot,
  withDataAttributes,
} from "./ui-sdk";
import {
  type DismissDetails,
  type DismissHandlers,
  useDismissRoot,
} from "./ui-sdk-dismiss";
import { cn } from "./utils";

/**
 * Radix menu parts on ui-sdk, shared by the dropdown menu, context menu and
 * menubar. Dismissal callbacks come from `ui-sdk-dismiss`.
 *
 * Each menu atom calls `createMenuParts` with its own class strings, so the
 * DOM stays what each Radix-based atom rendered. Class strings stay in the
 * atoms, where Tailwind sees them.
 */

/** A ui-sdk part's props with a plain string `className`, as Radix had. */
type Narrow<Props> = Omit<Props, "children" | "className" | "render"> & {
  children?: React.ReactNode;
  className?: string;
};

/** Radix's `asChild`: render the single child as the part's element. */
type AsChild = { asChild?: boolean };

type ContentOptions = { dismiss: DismissHandlers; loop?: boolean };

/** How a menu's content hands what Radix put on the content to its root. */
const ContentContext = React.createContext<
  ((options: ContentOptions) => void) | null
>(null);

/**
 * Radix puts `loop` and the dismissal callbacks on the content, ui-sdk on the
 * root: the root keeps what its content reports, and applies it.
 */
function useContentOptions(
  onOpenChange?: (open: boolean, details: DismissDetails) => void,
) {
  const { handleOpenChange, ref } = useDismissRoot(onOpenChange);
  const [loop, setLoop] = React.useState<boolean>();
  const register = React.useCallback(
    (options: ContentOptions) => {
      ref.current = options.dismiss;
      setLoop(options.loop);
    },
    [ref],
  );

  return { handleOpenChange, loop, register };
}

/** What differs between the menus: their class strings and icons. */
type MenuLook = {
  check: React.ReactNode;
  checkable: string;
  chevron: React.ReactNode;
  item: string;
  label: string;
  /** Names the menu after its trigger, as Radix's dropdown menu and menubar did. */
  labelledByTrigger?: boolean;
  popup: string;
  radio: React.ReactNode;
  shortcut: string;
  subTrigger: string;
};

type WithLook<Props> = Props & { look: MenuLook };

type MenuRootProps = Omit<
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
const Root = ({ dir, modal = true, onOpenChange, ...props }: MenuRootProps) => {
  const options = useContentOptions((open) => {
    onOpenChange?.(open);
  });

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

type MenuSubProps = Omit<
  React.ComponentProps<typeof MenuSubRoot>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void;
};

/** Holds the open state of a submenu. Renders no element. */
const Sub = ({ onOpenChange, ...props }: MenuSubProps) => {
  const options = useContentOptions((open) => {
    onOpenChange?.(open);
  });

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

type MenuGroupProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuGroupPart>> & {
    ref?: React.Ref<HTMLDivElement>;
  };

const Group = ({ asChild, children, ...props }: MenuGroupProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuGroupPart render={slot.render} {...props}>
      {slot.children}
    </MenuGroupPart>
  );
};

type MenuPortalProps = {
  children?: React.ReactNode;
  /** Radix-compatible: accepted, ui-sdk popups render in the top layer. */
  container?: unknown;
  /** Radix-compatible: accepted, use `forceMount` on the content. */
  forceMount?: true;
};

/** Renders its children. Radix needed a portal, ui-sdk popups use the top layer. */
const Portal = ({ children }: MenuPortalProps) => children;

type MenuContentProps = AsChild &
  DismissHandlers &
  MaterialProps &
  Narrow<Omit<React.ComponentProps<typeof MenuContentPart>, "keepMounted">> & {
    /** Keeps the content in the page while the menu stays closed. */
    forceMount?: boolean;
    /** Whether arrow keys wrap from the last item to the first. */
    loop?: boolean;
    onCloseAutoFocus?: (event: Event) => void;
    ref?: React.Ref<HTMLDivElement>;
  };

const contentState = (state: { open: boolean }): DataAttributes => ({
  "data-orientation": "vertical",
  ...openState(state),
});

/**
 * ui-sdk names a submenu after its trigger but not a root menu. The trigger's
 * id and the content's id share one base, so name the menu by it, as Radix did.
 */
const triggerLabel = (props: Record<string, unknown>): DataAttributes =>
  typeof props.id === "string" && !props["aria-labelledby"]
    ? { "aria-labelledby": props.id.replace(/-content$/, "-trigger") }
    : {};

/** The popup of a menu or submenu, with what Radix put on the content. */
const Popup = ({
  asChild,
  children,
  className,
  collisionPadding = 0,
  finalFocus,
  forceMount,
  look,
  loop = false,
  material = "glass",
  onCloseAutoFocus,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onPointerDownOutside,
  ...props
}: WithLook<MenuContentProps>) => {
  const slot = asChildProps({ asChild, children });
  const register = React.use(ContentContext);
  const renderContent = (
    renderProps: Record<string, unknown>,
    state: { open: boolean },
  ) =>
    renderElement(
      "div",
      {
        ...renderProps,
        ...contentState(state),
        ...(look.labelledByTrigger ? triggerLabel(renderProps) : {}),
      },
      slot.render,
      state,
    );
  React.useEffect(() => {
    register?.({
      dismiss: {
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
      className={cn(look.popup, className)}
      collisionPadding={collisionPadding}
      data-material={material}
      finalFocus={finalFocus ?? closeAutoFocus(onCloseAutoFocus)}
      keepMounted={forceMount}
      render={renderContent}
      {...props}
    >
      {slot.children}
    </MenuContentPart>
  );
};

type MenuSubTriggerProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuSubTriggerPart>> & {
    inset?: boolean;
    ref?: React.Ref<HTMLDivElement>;
  };

const SubTrigger = ({
  asChild,
  children,
  className,
  inset,
  look,
  ...props
}: WithLook<MenuSubTriggerProps>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuSubTriggerPart
      className={cn(look.subTrigger, inset && "pl-8", className)}
      render={withDataAttributes("div", openState, slot.render)}
      {...props}
    >
      {slot.children}
      {look.chevron}
    </MenuSubTriggerPart>
  );
};

type MenuItemProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuItemPart>> & {
    inset?: boolean;
    ref?: React.Ref<HTMLDivElement>;
    /** The text typeahead matches, when the children aren't plain text. */
    textValue?: string;
  };

const Item = ({
  asChild,
  children,
  className,
  inset,
  look,
  textValue,
  ...props
}: WithLook<MenuItemProps>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuItemPart
      className={cn(look.item, inset && "pl-8", className)}
      label={textValue}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </MenuItemPart>
  );
};

type MenuCheckboxItemProps = Narrow<
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

const MIXED: DataAttributes = { "aria-checked": "mixed" };

const CheckboxItem = ({
  checked,
  children,
  className,
  closeOnSelect = true,
  look,
  textValue,
  ...props
}: WithLook<MenuCheckboxItemProps>) => {
  const value = React.useId();
  const indeterminate = checked === "indeterminate";

  return (
    <MenuCheckboxItemPart
      checked={indeterminate ? false : checked}
      className={cn(look.checkable, className)}
      closeOnSelect={closeOnSelect}
      label={textValue}
      render={withDataAttributes("div", (state: { checked: boolean }) => ({
        ...checkedState({ ...state, indeterminate }),
        ...(indeterminate ? MIXED : {}),
      }))}
      value={value}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <MenuItemIndicator keepMounted={indeterminate}>
          {look.check}
        </MenuItemIndicator>
      </span>
      {children}
    </MenuCheckboxItemPart>
  );
};

type MenuRadioGroupProps = AsChild &
  Narrow<React.ComponentProps<typeof MenuRadioGroupPart>> & {
    ref?: React.Ref<HTMLDivElement>;
  };

const RadioGroup = ({ asChild, children, ...props }: MenuRadioGroupProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <MenuRadioGroupPart render={slot.render} {...props}>
      {slot.children}
    </MenuRadioGroupPart>
  );
};

type MenuRadioItemProps = Narrow<
  Omit<React.ComponentProps<typeof MenuRadioItemPart>, "onSelect">
> & {
  ref?: React.Ref<HTMLDivElement>;
  /** The text typeahead matches, when the children aren't plain text. */
  textValue?: string;
};

const RadioItem = ({
  children,
  className,
  closeOnSelect = true,
  look,
  textValue,
  ...props
}: WithLook<MenuRadioItemProps>) => (
  <MenuRadioItemPart
    className={cn(look.checkable, className)}
    closeOnSelect={closeOnSelect}
    label={textValue}
    render={withDataAttributes("div", checkedState)}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <MenuItemIndicator>{look.radio}</MenuItemIndicator>
    </span>
    {children}
  </MenuRadioItemPart>
);

type MenuLabelProps = React.ComponentPropsWithoutRef<"div"> & {
  asChild?: boolean;
  inset?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

/** A heading inside the menu. Like Radix's, a plain element. */
const Label = ({
  asChild,
  className,
  inset,
  look,
  ref,
  ...props
}: WithLook<MenuLabelProps>) => {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(look.label, inset && "pl-8", className)}
      ref={ref}
      {...props}
    />
  );
};

type MenuSeparatorProps = React.ComponentPropsWithoutRef<"div"> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

/** A rule between items. Like Radix's, a plain element. */
const Separator = ({
  asChild,
  className,
  ref,
  ...props
}: MenuSeparatorProps) => {
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

const Shortcut = ({
  className,
  look,
  ...props
}: WithLook<React.HTMLAttributes<HTMLSpanElement>>) => (
  <span className={cn(look.shortcut, className)} {...props} />
);

/** The look of the shadcn menus. A menu overrides what differs. */
const DEFAULT_LOOK = {
  check: <Check className="size-4" />,
  checkable:
    "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  chevron: <ChevronRight className="ml-auto size-4" />,
  item: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  label: "px-2 py-1.5 text-sm font-semibold text-foreground",
  radio: <Circle className="size-2 fill-current" />,
  shortcut: "ml-auto text-xs tracking-widest text-muted-foreground",
  subTrigger:
    "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
};

type Named<Props extends object> = ((props: Props) => React.ReactNode) & {
  displayName: string;
};

/** The part as a component of its own, so each menu names its copy. */
function named<Props extends object>(
  Part: (props: Props) => React.ReactNode,
  displayName: string,
): Named<Props> {
  const Copy = (props: Props) => <Part {...props} />;
  Copy.displayName = displayName;

  return Copy;
}

/** `named`, with the menu's look filled in. */
function bind<Props extends object>(
  Part: (props: WithLook<Props>) => React.ReactNode,
  look: MenuLook,
  displayName: string,
): Named<Props> {
  const Bound = (props: Props) => <Part {...props} look={look} />;
  Bound.displayName = displayName;

  return Bound;
}

/**
 * The parts every menu shares, named after the menu (`name`) and wearing its
 * look. A menu must give `popup`; the rest falls back to `DEFAULT_LOOK`.
 */
function createMenuParts(
  name: string,
  look: Partial<MenuLook> & Pick<MenuLook, "popup">,
) {
  const merged = { ...DEFAULT_LOOK, ...look };

  return {
    CheckboxItem: bind(CheckboxItem, merged, `${name}CheckboxItem`),
    Group: named(Group, `${name}Group`),
    Item: bind(Item, merged, `${name}Item`),
    Label: bind(Label, merged, `${name}Label`),
    Popup: bind(Popup, merged, `${name}Popup`),
    Portal: named(Portal, `${name}Portal`),
    RadioGroup: named(RadioGroup, `${name}RadioGroup`),
    RadioItem: bind(RadioItem, merged, `${name}RadioItem`),
    Root: named(Root, name),
    Separator: named(Separator, `${name}Separator`),
    Shortcut: bind(Shortcut, merged, `${name}Shortcut`),
    Sub: named(Sub, `${name}Sub`),
    SubTrigger: bind(SubTrigger, merged, `${name}SubTrigger`),
  };
}

export {
  type AsChild,
  ContentContext,
  createMenuParts,
  type MenuCheckboxItemProps,
  type MenuContentProps,
  type MenuGroupProps,
  type MenuItemProps,
  type MenuLabelProps,
  type MenuLook,
  type MenuPortalProps,
  type MenuRadioGroupProps,
  type MenuRadioItemProps,
  type MenuRootProps,
  type MenuSeparatorProps,
  type MenuSubProps,
  type MenuSubTriggerProps,
  type Narrow,
  useContentOptions,
  type WithLook,
};
