import * as React from "react";

import type { RenderProp } from "@ui-sdk/react/primitive";

import type { Material } from "./material";
import { named } from "./named";
import {
  type AsChildProps,
  asChildProps,
  closeAutoFocus,
  type DataAttributes,
  type NarrowPartProps,
  openAutoFocus,
  openState,
  useLazyElementRef,
  withDataAttributes,
} from "./ui-sdk";
import {
  DismissContext,
  type DismissHandlers,
  useDismissRoot,
  useRegisterDismissHandlers,
} from "./ui-sdk-dismiss";
import { cn } from "./utils";

/**
 * Radix dialog parts on ui-sdk, shared by the dialog, alert dialog, sheet and
 * drawer. `dialogRoot`, `dialogTrigger` and the other `dialog*` builders make
 * the parts that differ in nothing but their class strings; `useDialogPopup`
 * is what every content panel shares.
 *
 * Each dialog calls a builder per part with its own ui-sdk part and class
 * strings, so the DOM stays what each Radix-based atom rendered. Class strings
 * stay in the atoms, where Tailwind sees them. A builder has no shared state:
 * the atoms call it as a pure annotated call, so a bundler drops the parts a
 * page does not import, and `DialogHeader` does not pull in the ui-sdk dialog.
 */

type Part = React.JSXElementConstructor<never>;

/** What the backdrop takes from its dialog: its class strings. */
type OverlayLook = {
  /** Material of the backdrop when the caller passes none. Without one, the backdrop is the plain dimming veil. */
  material?: Material;
  /** Layout and animation of the backdrop. */
  veil: string;
  /** Extra attributes on the backdrop, like vaul's marker. */
  veilAttributes?: DataAttributes;
};

/** The props of a ui-sdk part. */
type PropsOf<Component> = Component extends (props: infer Props) => unknown
  ? Props
  : never;

type PartProps<TPart extends Part> = AsChildProps &
  NarrowPartProps<PropsOf<TPart>>;

type DialogRootProps<TRoot extends Part> = Omit<
  PropsOf<TRoot>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void;
};

type DialogOverlayProps<TBackdrop extends Part> = PartProps<TBackdrop> & {
  /** Keeps the veil in the page while closed. It has no effect: ui-sdk keeps the backdrop mounted until its exit animation ends. */
  forceMount?: true;
  /**
   * Draws the veil as a glass scrim (or a solid one). Without it the veil is
   * the dialog's own: glass for a dialog, a plain dim for the others.
   */
  material?: Material;
};

type DialogPortalProps = {
  children?: React.ReactNode;
  /** Radix-compatible: accepted, ui-sdk renders dialogs in the top layer. */
  container?: HTMLElement | null;
  /** Radix-compatible: accepted, use `forceMount` on the content. */
  forceMount?: true;
};

type Named<Props extends object, Result> = ((props: Props) => Result) & {
  displayName: string;
};

type LoosePart = React.ComponentType<Record<string, unknown>>;

/** The part with the loose props the factory hands it. Public types stay the part's own. */
const loose = (part: Part) => part as LoosePart;

type LooseProps = Record<string, unknown> & {
  asChild?: boolean;
  children?: React.ReactNode;
  className?: string;
};

/** A part that takes `asChild` and a base class, like a title or a description. */
function textPart(Part: LoosePart, base: string) {
  return function TextPart({
    asChild,
    children,
    className,
    ...props
  }: LooseProps) {
    const slot = asChildProps({ asChild, children });

    return (
      <Part className={cn(base, className)} render={slot.render} {...props}>
        {slot.children}
      </Part>
    );
  };
}

/** A part with `asChild` as its one extra prop, like a close button. */
function closePart(Part: LoosePart) {
  return function ClosePart({ asChild, children, ...props }: LooseProps) {
    const slot = asChildProps({ asChild, children });

    return (
      <Part render={slot.render} {...props}>
        {slot.children}
      </Part>
    );
  };
}

/** A static element with a base class, like a header or a footer. */
function boxPart(base: string) {
  return function BoxPart({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(base, className)} {...props} />;
  };
}

/** The root: holds the open state and runs the content's dismissal callbacks. */
function rootPart(Part: LoosePart) {
  return function RootPart({
    onOpenChange,
    ...props
  }: Record<string, unknown> & { onOpenChange?: (open: boolean) => void }) {
    const dismiss = useDismissRoot((open) => {
      onOpenChange?.(open);
    });

    return (
      <DismissContext value={dismiss.ref}>
        <Part onOpenChange={dismiss.handleOpenChange} {...props} />
      </DismissContext>
    );
  };
}

/** The trigger, with the Radix `data-state` attribute. */
function triggerPart(Part: LoosePart) {
  return function TriggerPart({ asChild, children, ...props }: LooseProps) {
    const slot = asChildProps({ asChild, children });

    return (
      <Part
        render={withDataAttributes("button", openState, slot.render)}
        {...props}
      >
        {slot.children}
      </Part>
    );
  };
}

/** The veil behind the panel, in the dialog's look. */
function overlayPart(Part: LoosePart, look: OverlayLook) {
  return function OverlayPart({
    asChild,
    children,
    className,
    forceMount: _forceMount,
    material = look.material,
    ...props
  }: LooseProps & { forceMount?: true; material?: Material }) {
    const slot = asChildProps({ asChild, children });

    return (
      <Part
        className={cn(
          material ? "vllnt-glass-scrim" : "bg-black/80",
          look.veil,
          className,
        )}
        data-material={material}
        render={withDataAttributes(
          "div",
          (state: { open: boolean }) => ({
            ...openState(state),
            ...look.veilAttributes,
          }),
          slot.render,
        )}
        {...props}
      >
        {slot.children}
      </Part>
    );
  };
}

/**
 * Kept for compatibility. ui-sdk renders a dialog in the browser top layer,
 * so there is nothing to portal and this renders its children as is.
 * `container` and `forceMount` have no effect here.
 */
function portalPart() {
  return function PortalPart({ children }: DialogPortalProps): React.ReactNode {
    return children;
  };
}

/** The root: holds the open state and runs the content's dismissal callbacks. */
export function dialogRoot<TRoot extends Part>(
  displayName: string,
  Root: TRoot,
): Named<DialogRootProps<TRoot>, React.JSX.Element> {
  return named(displayName, rootPart(loose(Root)));
}

/** The trigger, with the Radix `data-state` attribute. */
export function dialogTrigger<TTrigger extends Part>(
  displayName: string,
  Trigger: TTrigger,
): Named<PartProps<TTrigger>, React.JSX.Element> {
  return named(displayName, triggerPart(loose(Trigger)));
}

/** A close button that takes `asChild`. */
export function dialogClose<TClose extends Part>(
  displayName: string,
  Close: TClose,
): Named<PartProps<TClose>, React.JSX.Element> {
  return named(displayName, closePart(loose(Close)));
}

/** The portal, kept for compatibility. It renders its children as they are. */
export function dialogPortal(
  displayName: string,
): Named<DialogPortalProps, React.ReactNode> {
  return named(displayName, portalPart());
}

/** The veil behind the panel, in the dialog's look. */
export function dialogOverlay<TBackdrop extends Part>(
  displayName: string,
  Backdrop: TBackdrop,
  look: OverlayLook,
): Named<DialogOverlayProps<TBackdrop>, React.JSX.Element> {
  return named(displayName, overlayPart(loose(Backdrop), look));
}

/** A header or a footer: a static element with the dialog's class. */
export function dialogBox(
  displayName: string,
  className: string,
): Named<React.HTMLAttributes<HTMLDivElement>, React.JSX.Element> {
  return named(displayName, boxPart(className));
}

/** The title, which takes `asChild` and the dialog's class. */
export function dialogTitle<TTitle extends Part>(
  displayName: string,
  Title: TTitle,
  className: string,
): Named<PartProps<TTitle>, React.JSX.Element> {
  return named(displayName, textPart(loose(Title), className));
}

/** The description, which takes `asChild` and the dialog's class. */
export function dialogDescription<TDescription extends Part>(
  displayName: string,
  Description: TDescription,
  className: string,
): Named<PartProps<TDescription>, React.JSX.Element> {
  return named(displayName, textPart(loose(Description), className));
}

/** Both spellings of a modal's open state: `isOpen`/`onClose` and `open`/`onOpenChange`. */
type OpenAliases = {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

/**
 * Reads the open state a modal got, in either spelling: `open` and
 * `onOpenChange` win over `isOpen` and `onClose`. Closing calls both callbacks.
 */
function openAliases({ isOpen, onClose, onOpenChange, open }: OpenAliases): {
  handleOpenChange: (open: boolean) => void;
  open: boolean;
} {
  return {
    handleOpenChange: (next) => {
      onOpenChange?.(next);
      if (!next) {
        onClose?.();
      }
    },
    open: open ?? isOpen ?? false,
  };
}

/** The Radix callbacks that move focus; each may call `preventDefault()`. */
type PopupFocusHandlers = {
  /** Radix-compatible: call `preventDefault()` to leave focus where your handler put it. */
  onCloseAutoFocus?: (event: Event) => void;
  /** Radix-compatible: call `preventDefault()` to leave focus where your handler put it. */
  onOpenAutoFocus?: (event: Event) => void;
};

/** How a dialog draws the veil behind its panel. */
type PopupOverlay = "none" | "scrim";

/** The props every dialog panel takes next to the ui-sdk content part's own. */
type DialogContentOptions = AsChildProps &
  PopupFocusHandlers & {
    /** Keeps the panel in the page while closed, like Radix's `forceMount`. */
    forceMount?: boolean;
    /**
     * Veil drawn behind the panel. `"scrim"` (default) dims the page;
     * `"none"` draws nothing, so the page stays fully visible behind the panel.
     * The panel stays modal either way: it traps focus, locks page scroll and
     * hides the page from assistive technology.
     */
    overlay?: PopupOverlay;
  };

type DialogPopupOptions<State extends { open: boolean }> = AsChildProps &
  DismissHandlers &
  PopupFocusHandlers & {
    /** Extra data attributes for the panel, next to `data-state`. */
    attributes?: (state: State) => DataAttributes;
    children?: React.ReactNode;
    /** Where focus lands when the panel opens. Defaults to the panel's first tabbable element. */
    focusTarget?: () => HTMLElement | null;
    forceMount?: boolean;
    /** The caller's names for the panel: an own `aria-label` replaces the part's `aria-labelledby`. */
    names: { "aria-label"?: string; "aria-labelledby"?: string };
    ref?: React.Ref<HTMLDivElement>;
  };

/**
 * What {@link useDialogPopup} hands a panel, to give to its ui-sdk content part.
 * The panel destructures it: React's ref lint rejects reading these fields off
 * the result object.
 */
type DialogPopup<State> = {
  /** The `finalFocus` of the content part. */
  closeFocus: ReturnType<typeof closeAutoFocus>;
  /** The `keepMounted` of the content part. */
  keepMounted?: boolean;
  /** The `initialFocus` of the content part. */
  openFocus: ReturnType<typeof openAutoFocus>;
  /** The children to render in the panel: the single child element becomes the panel with `asChild`. */
  panelChildren: React.ReactNode;
  /** The `ref` of the content part. */
  panelReference: React.RefCallback<HTMLDivElement>;
  /** The `render` of the content part. */
  render: RenderProp<State>;
  /** Whether `asChild` made the child element the panel. */
  replaced: boolean;
};

/**
 * What a dialog panel shares: the Radix dismissal and focus callbacks, the
 * element it renders, `asChild`, and the data attributes. The panel gives
 * these to its ui-sdk content part and keeps its own classes, veil and extras.
 */
function useDialogPopup<State extends { open: boolean } = { open: boolean }>({
  asChild,
  attributes,
  children,
  focusTarget,
  forceMount,
  names,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  ref,
}: DialogPopupOptions<State>): DialogPopup<State> {
  const [content, contentReference] = useLazyElementRef(ref);
  const slot = asChildProps({ asChild, children });
  const ownName =
    names["aria-label"] !== undefined && names["aria-labelledby"] === undefined;
  useRegisterDismissHandlers({
    onEscapeKeyDown,
    onFocusOutside,
    onInteractOutside,
    onPointerDownOutside,
  });

  return {
    closeFocus: closeAutoFocus(onCloseAutoFocus),
    keepMounted: forceMount,
    openFocus: openAutoFocus(
      () => focusTarget?.() ?? content.current,
      onOpenAutoFocus,
    ),
    panelChildren: slot.children,
    panelReference: contentReference,
    render: withDataAttributes(
      "div",
      (state: State) => ({
        ...openState(state),
        ...attributes?.(state),
        ...(ownName ? { "aria-labelledby": undefined } : {}),
      }),
      slot.render,
    ),
    replaced: slot.render !== undefined,
  };
}

export {
  type DialogContentOptions,
  type DialogPopup,
  type OpenAliases,
  openAliases,
  type OverlayLook,
  type PopupFocusHandlers,
  type PopupOverlay,
  useDialogPopup,
};
