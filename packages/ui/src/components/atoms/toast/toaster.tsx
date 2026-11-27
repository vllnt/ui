"use client";

import * as React from "react";

import { useTheme } from "next-themes";

import { named } from "../../../lib/named";

import { setDefaultToastDuration } from "./toast-api";
import type { ToasterProps } from "./toaster-region";

// The region is most of the toast code: it loads once the Toaster mounts, not
// with the page's first bundle. Toasts shown before then wait in the queue.
const ToasterRegion = React.lazy(() =>
  import("./toaster-region").then((module) => ({
    default: module.ToasterRegion,
  })),
);

const noop = (): void => undefined;

function subscribeToNothing(): () => void {
  return noop;
}

const Toaster = /* @__PURE__ */ named(
  "Toaster",
  ({ duration, theme: themeProperty, ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();
    const mounted = React.useSyncExternalStore(
      subscribeToNothing,
      () => true,
      () => false,
    );
    const toastDuration = duration ?? props.toastOptions?.duration;

    React.useEffect(() => {
      setDefaultToastDuration(toastDuration);
      return () => {
        setDefaultToastDuration(undefined);
      };
    }, [toastDuration]);

    if (!mounted) {
      return null;
    }

    return (
      <React.Suspense fallback={null}>
        <ToasterRegion
          theme={themeProperty ?? (theme as ToasterProps["theme"])}
          {...props}
        />
      </React.Suspense>
    );
  },
);

export { Toaster };

export { type ToasterProps } from "./toaster-region";
