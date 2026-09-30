"use client";

import type { Ref } from "react";
import type { Text as NativeTextInstance, TextProps } from "react-native";

import { useColorShimmerText } from "../../primitives/color-shimmer-text";
import type { ReducedMotionService } from "../../primitives/use-reduced-motion";

/** Props for a native semantic-color shimmer fallback. */
export type ShimmerTextProps = Omit<TextProps, "children"> & {
  readonly children: string;
  readonly duration?: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<NativeTextInstance>;
};

/** Cycles semantic text color; a sweeping gradient requires an injected renderer. */
function ShimmerText({ duration = 3000, ...props }: ShimmerTextProps) {
  return useColorShimmerText({ ...props, duration }, 0);
}
ShimmerText.displayName = "ShimmerText";

export { ShimmerText };
