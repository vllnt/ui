"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@vllnt/ui";
import type { CSSProperties } from "react";

import { THEME_TOKENS, type ThemeColors } from "@/lib/theme-tokens";

type ThemePreviewProps = {
  readonly colors: ThemeColors;
  readonly radius: string;
};

function toCssVars(colors: ThemeColors, radius: string): CSSProperties {
  const entries = THEME_TOKENS.map(
    (token) => [token.cssVar, colors[token.name] ?? ""] as const,
  );
  return {
    ...Object.fromEntries(entries),
    "--radius": radius,
  } as CSSProperties;
}

/**
 * Renders representative components with the supplied theme applied via inline
 * CSS variables (OKLCH channels), so the preview reflects the edited mode
 * regardless of the surrounding light/dark state.
 */
export function ThemePreview({ colors, radius }: ThemePreviewProps) {
  return (
    <div
      className="space-y-6 rounded-lg border border-border bg-background p-6 text-foreground"
      style={toCssVars(colors, radius)}
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">The quick brown fox</h3>
        <p className="text-sm text-muted-foreground">
          Jumps over the lazy dog. This preview uses your live theme tokens.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge>Badge</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="theme-preview-email">Email</Label>
        <Input id="theme-preview-email" placeholder="you@example.com" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade your plan</CardTitle>
          <CardDescription>
            Unlock unlimited projects and priority support.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Cards use the card, border, and muted tokens together.
        </CardContent>
        <CardFooter className="gap-2">
          <Button size="sm">Confirm</Button>
          <Button size="sm" variant="outline">
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
