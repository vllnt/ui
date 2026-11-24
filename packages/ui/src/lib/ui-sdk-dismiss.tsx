import * as React from "react";

/**
 * Radix's dismissal callbacks on ui-sdk popups.
 *
 * Radix put `onEscapeKeyDown`, `onPointerDownOutside` and the like on the
 * content, and `event.preventDefault()` kept the popup open. ui-sdk reports
 * every dismissal to the root's `onOpenChange(open, details)`, and
 * `details.cancel()` keeps it open. So the content hands its callbacks to the
 * root, and the root runs them when the popup closes:
 *
 *   // root
 *   const dismiss = useDismissRoot((open) => onOpenChange?.(open));
 *   <DismissContext value={dismiss.ref}>
 *     <PopupRoot onOpenChange={dismiss.handleOpenChange} />
 *   </DismissContext>
 *
 *   // content
 *   useRegisterDismissHandlers({ onEscapeKeyDown, onPointerDownOutside });
 *
 * A root that keeps its callbacks some other way (a menu also needs `loop`)
 * calls `runDismissHandlers` itself.
 */

/** The Radix callbacks a content takes; each may call `preventDefault()`. */
type DismissHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
  onPointerDownOutside?: (event: Event) => void;
};

/** What ui-sdk hands `onOpenChange` besides the new state. */
type DismissDetails = {
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
 * Runs the callbacks that match why the popup closes, with the DOM event
 * ui-sdk reports, and keeps the popup open when one calls `preventDefault()`.
 */
function runDismissHandlers(
  handlers: DismissHandlers,
  {
    cancel,
    event,
    reason,
  }: Pick<DismissDetails, "cancel" | "event" | "reason">,
): void {
  if (!event) {
    return;
  }
  const matching = {
    "escape-key": [handlers.onEscapeKeyDown],
    "focus-out": [handlers.onFocusOutside, handlers.onInteractOutside],
    "outside-press": [
      handlers.onPointerDownOutside,
      handlers.onInteractOutside,
    ],
  }[reason as "escape-key" | "focus-out" | "outside-press"] as
    | ((event: Event) => void)[]
    | undefined;
  if (matching && callPreventDefault(event, matching)) {
    cancel();
  }
}

/** Where a content hands its callbacks to the root that owns the open state. */
const DismissContext =
  React.createContext<null | React.RefObject<DismissHandlers>>(null);

/** Hands the content's callbacks to the root, which runs them on dismissal. */
function useRegisterDismissHandlers(handlers: DismissHandlers): void {
  const registryRef = React.use(DismissContext);
  React.useEffect(() => {
    if (registryRef) {
      registryRef.current = handlers;
    }
  });
}

/**
 * The root's side: the `ref` for `DismissContext`, and an `onOpenChange` for
 * the ui-sdk root. It runs the registered callbacks when the popup closes and
 * calls `onOpenChange` unless one of them kept the popup open.
 */
function useDismissRoot(
  onOpenChange?: (open: boolean, details: DismissDetails) => void,
) {
  const ref = React.useRef<DismissHandlers>({});

  return {
    handleOpenChange: (open: boolean, details: DismissDetails) => {
      if (!open) {
        runDismissHandlers(ref.current, details);
      }
      if (!details.canceled) {
        onOpenChange?.(open, details);
      }
    },
    ref,
  };
}

export {
  callPreventDefault,
  DismissContext,
  type DismissDetails,
  type DismissHandlers,
  runDismissHandlers,
  useDismissRoot,
  useRegisterDismissHandlers,
};
