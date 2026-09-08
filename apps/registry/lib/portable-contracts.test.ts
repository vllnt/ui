import {
  type BadgeProps,
  type ButtonProps,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type HeadingLevel,
  type TextProps,
} from "@vllnt/ui";
import type {
  BadgeVariant,
  ButtonSize,
  ButtonVariant,
  CardPart,
  HeadingLevel as CoreHeadingLevel,
  TextSize,
  TextTone,
  TextWeight,
} from "@vllnt/ui-core";
import { describe, expect, it } from "vitest";

const badgeVariants = {
  default: true,
  destructive: true,
  outline: true,
  secondary: true,
} satisfies Record<BadgeVariant, true> &
  Record<NonNullable<BadgeProps["variant"]>, true>;

const buttonSizes = {
  default: true,
  icon: true,
  lg: true,
  sm: true,
} satisfies Record<ButtonSize, true> &
  Record<NonNullable<ButtonProps["size"]>, true>;

const buttonVariants = {
  default: true,
  destructive: true,
  ghost: true,
  link: true,
  outline: true,
  secondary: true,
} satisfies Record<ButtonVariant, true> &
  Record<NonNullable<ButtonProps["variant"]>, true>;

const cardParts: readonly CardPart[] = [
  "Card",
  "CardContent",
  "CardDescription",
  "CardFooter",
  "CardHeader",
  "CardTitle",
];
const webCardParts = [
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
];

const headingLevels = [1, 2, 3, 4, 5, 6] satisfies readonly CoreHeadingLevel[];
const webHeadingLevels: readonly HeadingLevel[] = headingLevels;

const textSizes = {
  base: true,
  caption: true,
  lead: true,
  small: true,
} satisfies Record<TextSize, true> &
  Record<NonNullable<TextProps["size"]>, true>;

const textTones = {
  default: true,
  muted: true,
} satisfies Record<TextTone, true> &
  Record<NonNullable<TextProps["tone"]>, true>;

const textWeights = {
  medium: true,
  normal: true,
  semibold: true,
} satisfies Record<TextWeight, true> &
  Record<NonNullable<TextProps["weight"]>, true>;

describe("portable component contracts", () => {
  it("remain structurally compatible with the public web renderer", () => {
    expect([
      badgeVariants,
      buttonSizes,
      buttonVariants,
      cardParts,
      webCardParts,
      headingLevels,
      webHeadingLevels,
      textSizes,
      textTones,
      textWeights,
    ]).toHaveLength(10);
  });
});
