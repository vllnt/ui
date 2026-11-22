"use client";

import * as React from "react";

import type { MaterialProps } from "../../../lib/material";
import { cn } from "../../../lib/utils";

/** Props for {@link FloatingNavbar}. `material="solid"` opts out of glass. */
export type FloatingNavbarProps = MaterialProps &
  React.ComponentPropsWithoutRef<"nav">;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (): void => {
      setReduced(query.matches);
    };

    onChange();
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
    };
  }, []);

  return reduced;
}

function useScrollVisibility(reduced: boolean): boolean {
  const [visible, setVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    if (reduced || typeof window === "undefined") {
      return;
    }

    const onScroll = (): void => {
      const current = window.scrollY;
      setVisible(current < lastScrollY.current || current < 16);
      lastScrollY.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  return reduced ? true : visible;
}

/**
 * Floating navigation bar that hides on scroll down and reveals on scroll up.
 *
 * Respects `prefers-reduced-motion`: the bar stays visible.
 *
 * The design library names the site header `Site header`, and its code name is
 * `NavbarSaas`. A `floating` style will join `NavbarSaas` as an added prop.
 * Until then, use this component for a floating bar.
 *
 * @example
 * ```tsx
 * <FloatingNavbar>
 *   <a href="#home">Home</a>
 * </FloatingNavbar>
 * ```
 */
export const FloatingNavbar = ({
  children,
  className,
  material = "glass",
  ref,
  ...props
}: FloatingNavbarProps & { ref?: React.Ref<HTMLElement> }) => {
  const reduced = usePrefersReducedMotion();
  const visible = useScrollVisibility(reduced);

  return (
    <nav
      className={cn(
        "vllnt-glass-floating fixed inset-x-0 top-4 z-50 mx-auto flex w-fit items-center gap-4 rounded-full border px-6 py-2 transition-transform duration-300",
        visible ? "" : "-translate-y-[150%]",
        className,
      )}
      data-material={material}
      ref={ref}
      {...props}
    >
      {children}
    </nav>
  );
};
FloatingNavbar.displayName = "FloatingNavbar";
