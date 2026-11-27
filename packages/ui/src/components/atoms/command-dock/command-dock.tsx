"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { MaterialProps } from "../../../lib/material";
import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";

/**
 * Tone of a dock action — drives its accent color.
 *
 * @public
 */
export type CommandDockTone = "danger" | "neutral" | "primary" | "success";

const TONE_CLASS: Record<CommandDockTone, string> = {
  danger: "text-red-600 dark:text-red-400",
  neutral: "text-foreground",
  primary: "text-blue-600 dark:text-blue-400",
  success: "text-emerald-600 dark:text-emerald-400",
};

/**
 * One action button slotted in the dock.
 *
 * @public
 */
export type CommandDockAction = {
  /** Optional badge value rendered as a small dot or count. */
  badge?: ReactNode;
  /** Glyph rendered above the label (single character or icon). */
  glyph: ReactNode;
  /** Stable identifier — used as the React key + analytics hook. */
  id: string;
  /** Short label shown beneath the glyph. */
  label: ReactNode;
  /** Click handler. */
  onActivate: () => void;
  /** Optional tone. Defaults to `"neutral"`. */
  tone?: CommandDockTone;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type CommandDockLabels = {
  /** Aria-label for the command-palette trigger. Defaults to `"Open command palette"`. */
  paletteTrigger?: string;
  /** Aria-label for the dock. Defaults to `"Command dock"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  paletteTrigger: "Open command palette",
  region: "Command dock",
} as const satisfies Required<CommandDockLabels>;

/**
 * Props for {@link CommandDock}.
 *
 * @public
 */
export type CommandDockProps = {
  /** Action buttons in render order. */
  actions: CommandDockAction[];
  /** Localizable strings. */
  labels?: CommandDockLabels;
  /** Optional handler for the "..." command-palette trigger. */
  onOpenPalette?: () => void;
} & MaterialProps &
  ComponentPropsWithoutRef<"nav">;

const ActionButton = (props: {
  action: CommandDockAction;
}): React.ReactElement => {
  const { action } = props;
  const tone = action.tone ?? "neutral";
  const handleActivateAction = (): void => {
    action.onActivate();
  };
  return (
    <button
      className="group relative flex size-12 flex-col items-center justify-center gap-0.5 rounded-md border border-transparent text-[10px] uppercase tracking-wide text-muted-foreground transition-colors hover:border-border hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-command-action={action.id}
      data-command-tone={tone}
      onClick={handleActivateAction}
      type="button"
    >
      <span
        aria-hidden="true"
        className={cn(
          "text-base leading-none transition-transform group-hover:scale-110",
          TONE_CLASS[tone],
        )}
      >
        {action.glyph}
      </span>
      <span className="truncate">{action.label}</span>
      {action.badge ? (
        <span
          className="absolute right-1 top-1 inline-flex min-h-[14px] min-w-[14px] items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-medium text-background"
          data-command-badge
        >
          {action.badge}
        </span>
      ) : null}
    </button>
  );
};

/**
 * Floating bottom dock for the spatial canvas. Renders a compact row
 * of agent / quick-action buttons plus a trailing command-palette
 * trigger. Pure presentation; the host wires `onActivate` per action
 * and `onOpenPalette` for the palette button.
 *
 * @example
 * ```tsx
 * <CommandDock
 *   actions={[
 *     { id: "summon", glyph: "+", label: "Summon", tone: "primary",
 *       onActivate: () => spawnAgent() },
 *     { id: "review", glyph: "✓", label: "Review", tone: "success",
 *       onActivate: () => openReview() },
 *   ]}
 *   onOpenPalette={() => openCommandPalette()}
 * />
 * ```
 *
 * @public
 */
export const CommandDock = /* @__PURE__ */ named(
  "CommandDock",
  ({ ref, ...props }: CommandDockProps & { ref?: React.Ref<HTMLElement> }) => {
    const {
      actions,
      className,
      labels,
      material = "glass",
      onOpenPalette,
      ...rest
    } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const handlePalette = (): void => {
      onOpenPalette?.();
    };
    return (
      <nav
        aria-label={resolvedLabels.region}
        className={cn(
          "vllnt-glass-floating vllnt-glass-dense inline-flex items-center gap-1 rounded-2xl border p-1.5",
          className,
        )}
        data-command-dock
        data-material={material}
        ref={ref}
        {...rest}
      >
        {actions.map((action) => (
          <ActionButton action={action} key={action.id} />
        ))}
        {onOpenPalette ? (
          <>
            <span aria-hidden="true" className="mx-1 h-8 w-px bg-border" />
            <button
              aria-label={resolvedLabels.paletteTrigger}
              className="flex size-12 items-center justify-center rounded-md border border-transparent text-base text-muted-foreground transition-colors hover:border-border hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-command-palette-trigger
              onClick={handlePalette}
              type="button"
            >
              <span aria-hidden="true">⌘</span>
            </button>
          </>
        ) : null}
      </nav>
    );
  },
);

/**
 * @deprecated Use CommandDock. The release after next removes JarvisDock (see vllnt/ui#682).
 */
export const JarvisDock = CommandDock;

/**
 * @deprecated Use CommandDockAction. The release after next removes JarvisDockAction (see vllnt/ui#682).
 */
export type JarvisDockAction = CommandDockAction;

/**
 * @deprecated Use CommandDockLabels. The release after next removes JarvisDockLabels (see vllnt/ui#682).
 */
export type JarvisDockLabels = CommandDockLabels;

/**
 * @deprecated Use CommandDockProps. The release after next removes JarvisDockProps (see vllnt/ui#682).
 */
export type JarvisDockProps = CommandDockProps;

/**
 * @deprecated Use CommandDockTone. The release after next removes JarvisDockTone (see vllnt/ui#682).
 */
export type JarvisDockTone = CommandDockTone;
