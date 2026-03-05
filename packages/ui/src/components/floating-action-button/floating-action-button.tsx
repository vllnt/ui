"use client";

import { memo } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type FloatingActionButtonProps = {
  "aria-label": string;
  children: ReactNode;
  className?: string;
  onClick: () => void;
  position?: "bottom-left" | "bottom-right";
};

function FloatingActionButtonImpl({
  "aria-label": ariaLabel,
  children,
  className,
  onClick,
  position = "bottom-right",
}: FloatingActionButtonProps): React.ReactNode {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "fixed z-40 flex h-12 w-12 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg",
        "transition-transform hover:scale-110",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        position === "bottom-right" && "bottom-20 right-4 sm:bottom-4",
        position === "bottom-left" && "bottom-20 left-4 sm:bottom-4",
        className,
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export const FloatingActionButton = memo(FloatingActionButtonImpl);
FloatingActionButton.displayName = "FloatingActionButton";
