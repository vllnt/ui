"use client";

import type { Ref } from "react";
import type { Text as NativeTextInstance, TextProps } from "react-native";

import { useColorShimmerText } from "../../../primitives/color-shimmer-text";
import type { ReducedMotionService } from "../../../primitives/use-reduced-motion";

/** Props for native text that cycles between semantic foreground tones. */
export type TextShimmerProps = Omit<TextProps, "children"> & {
  readonly children: string;
  readonly duration?: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<NativeTextInstance>;
};

/** Provides a dependency-free color cycle in place of web gradient clipping. */
function TextShimmer({ duration = 2000, ...props }: TextShimmerProps) {
  return useColorShimmerText({ ...props, duration }, 1);
}
TextShimmer.displayName = "TextShimmer";

export { TextShimmer };
