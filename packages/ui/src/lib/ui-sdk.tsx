import * as React from "react";

import {
  mergeProps,
  renderElement,
  type RenderProp,
} from "@ui-sdk/react/primitive";

/** Radix's `asChild`: render the single child as the part's element. */
type AsChildProps = { asChild?: boolean };

/** A ui-sdk part's props with a plain string `className`, as Radix had. */
type NarrowPartProps<Props> = Omit<
  Props,
  "children" | "className" | "render"
> & {
  children?: React.ReactNode;
  className?: string;
};

type DataAttributes = Record<
  `aria-${string}` | `data-${string}`,
  string | undefined
>;

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
};

/**
 * Renders its single child element with the slot's props merged in: the
 * `asChild` pattern. The child's props win; class names, styles and refs
 * combine, and the child's event handler runs before the slot's.
 */
function Slot({ children, ref, ...props }: SlotProps) {
  if (!React.isValidElement<Record<string, unknown>>(children)) {
    return null;
  }

  return React.cloneElement(
    children,
    mergeProps(props, ref ? { ref } : {}, children.props),
  );
}
Slot.displayName = "Slot";

/**
 * Maps the `asChild` prop onto a ui-sdk part: with `asChild`, the single child
 * element becomes the part's `render` element and takes the part's props.
 */
function asChildProps<Children>({
  asChild,
  children,
}: {
  asChild?: boolean;
  children?: Children;
}): {
  children?: Children;
  render?: React.ReactElement<Record<string, unknown>>;
} {
  return asChild && React.isValidElement<Record<string, unknown>>(children)
    ? { render: children }
    : { children };
}

/**
 * A `render` function that adds the data attributes a part's state maps to,
 * such as the `data-state` values Radix emitted, so selectors written against
 * them keep matching. `render` is the caller's own element or function, if any.
 */
function withDataAttributes<State>(
  tag: string,
  attributes: (state: State) => DataAttributes,
  render?: RenderProp<State>,
): RenderProp<State> {
  return (props, state) =>
    renderElement(tag, { ...props, ...attributes(state) }, render, state);
}

/**
 * Runs a Radix-style auto-focus handler with a cancelable event dispatched on
 * the content, as Radix's focus scope did, so `event.currentTarget` is the
 * content element. Returns whether the handler called `preventDefault()`.
 */
function autoFocusEvent(
  handler: ((event: Event) => void) | undefined,
  content: HTMLElement | null,
) {
  const event = new Event("vllnt.autoFocus", { cancelable: true });
  if (!handler) {
    return false;
  }
  if (!content) {
    handler(event);
    return event.defaultPrevented;
  }
  content.addEventListener(event.type, handler, { once: true });
  content.dispatchEvent(event);
  return event.defaultPrevented;
}

function activeHTMLElement(): HTMLElement | undefined {
  const active = document.activeElement;
  return active instanceof HTMLElement ? active : undefined;
}

const TABBABLE =
  'input:not([type="hidden"]), select, textarea, button, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * The `initialFocus` of a dialog-like popup, matching Radix's focus scope:
 * focus stays put when already inside the content, otherwise the first
 * tabbable element that isn't a link takes it, and an input's text is
 * selected. `onOpenAutoFocus` gets a cancelable event first; calling
 * `preventDefault()` keeps focus where the handler put it.
 */
function openAutoFocus(
  getContent: () => HTMLElement | null,
  onOpenAutoFocus?: (event: Event) => void,
): () => HTMLElement | undefined {
  return () => {
    const content = getContent();
    if (autoFocusEvent(onOpenAutoFocus, content)) {
      return activeHTMLElement();
    }
    const active = activeHTMLElement();
    if (!content || (active && content.contains(active))) {
      return active;
    }
    const target = [...content.querySelectorAll<HTMLElement>(TABBABLE)].find(
      (element) =>
        element.tabIndex >= 0 &&
        !element.matches(":disabled") &&
        element.getClientRects().length > 0,
    );
    if (target instanceof HTMLInputElement) {
      queueMicrotask(() => {
        target.select();
      });
    }
    return target ?? content;
  };
}

/**
 * Adapts a Radix-style `onCloseAutoFocus` handler to a ui-sdk `finalFocus`
 * function. The handler gets a cancelable event; when it calls
 * `preventDefault()`, focus stays where the handler put it instead of
 * returning to the trigger.
 */
function closeAutoFocus(
  onCloseAutoFocus: ((event: Event) => void) | undefined,
  getContent?: () => HTMLElement | null,
): (() => HTMLElement | undefined) | undefined {
  if (!onCloseAutoFocus) {
    return undefined;
  }

  return () =>
    autoFocusEvent(onCloseAutoFocus, getContent?.() ?? null)
      ? activeHTMLElement()
      : undefined;
}

function assignRef<T>(ref: React.Ref<T> | undefined, element: null | T) {
  if (typeof ref === "function") {
    ref(element);
  } else if (ref) {
    ref.current = element;
  }
}

/**
 * Keeps the element a part renders in a ref, for callbacks that read it when
 * they run (an `initialFocus` function), and still passes it to the caller's
 * `ref`. It never re-renders, so prefer it to `useElementRef` unless an effect
 * or the render itself must react to the element.
 */
function useLazyElementRef<T>(
  ref?: React.Ref<T>,
): readonly [React.RefObject<null | T>, React.RefCallback<T>] {
  const element = React.useRef<null | T>(null);
  const callback = React.useCallback(
    (node: null | T) => {
      element.current = node;
      assignRef(ref, node);
    },
    [ref],
  );
  return [element, callback] as const;
}

/**
 * Tracks the element a part renders, for wrappers that need it (focus,
 * anchoring), and still passes it to the caller's `ref`. It re-renders once
 * the element mounts, so an effect can react to it; for a callback that reads
 * the element later, use `useLazyElementRef`.
 */
function useElementRef<T>(
  ref: React.Ref<T> | undefined,
): readonly [null | T, React.RefCallback<T>] {
  const [element, setElement] = React.useState<null | T>(null);
  const callback = React.useCallback(
    (node: null | T) => {
      setElement(node);
      assignRef(ref, node);
    },
    [ref],
  );
  return [element, callback] as const;
}

const openState = (state: { open: boolean }): DataAttributes => ({
  "data-state": state.open ? "open" : "closed",
});

const checkedState = (state: {
  checked: boolean;
  indeterminate?: boolean;
}): DataAttributes => ({
  "data-state": state.indeterminate
    ? "indeterminate"
    : state.checked
      ? "checked"
      : "unchecked",
});

export {
  type AsChildProps,
  asChildProps,
  assignRef,
  checkedState,
  closeAutoFocus,
  type DataAttributes,
  type NarrowPartProps,
  openAutoFocus,
  openState,
  Slot,
  useElementRef,
  useLazyElementRef,
  withDataAttributes,
};
