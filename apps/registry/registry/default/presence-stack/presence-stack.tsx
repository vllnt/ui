"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "@vllnt/ui";

/**
 * Presence status — drives the corner dot color.
 *
 * @public
 */
export type PresenceStatus = "active" | "away" | "idle" | "offline";

const STATUS_DOT: Record<PresenceStatus, string> = {
  active: "bg-emerald-500",
  away: "bg-amber-500",
  idle: "bg-muted-foreground",
  offline: "bg-muted-foreground/40",
};

/**
 * One user in the presence stack.
 *
 * @public
 */
export type PresenceUser = {
  /** Optional accent color (hex / oklch / var). Drives the avatar fill. */
  color?: string;
  /** Stable identifier — used as the React key. */
  id: string;
  /** Avatar initial / glyph. */
  initial: ReactNode;
  /** Display name shown on hover (`title` attribute). */
  name?: string;
  /** Optional status. Defaults to `"active"`. */
  status?: PresenceStatus;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type PresenceStackLabels = {
  /** Suffix for the overflow chip. Defaults to `"more"`. */
  overflowSuffix?: string;
  /** Aria-label override. Defaults to `"Live presence"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  overflowSuffix: "more",
  region: "Live presence",
} as const satisfies Required<PresenceStackLabels>;

/**
 * Props for {@link PresenceStack}.
 *
 * @public
 */
export type PresenceStackProps = {
  /** Localizable strings. */
  labels?: PresenceStackLabels;
  /** Cap the rendered users; the rest collapse into a `+N` chip. Defaults to `5`. */
  max?: number;
  /** Optional click handler for the overflow chip. */
  onOverflowActivate?: () => void;
  /** Users sorted in render order (most-relevant first). */
  users: PresenceUser[];
} & ComponentPropsWithoutRef<"div">;

const Avatar = (props: { user: PresenceUser }): React.ReactElement => {
  const { user } = props;
  const status = user.status ?? "active";
  return (
    <span
      className="relative -ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-[11px] font-semibold text-white shadow-sm first:ml-0"
      data-presence-stack-status={status}
      data-presence-stack-user={user.id}
      style={{ backgroundColor: user.color ?? "var(--foreground)" }}
      title={user.name}
    >
      {user.initial}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background",
          STATUS_DOT[status],
        )}
        data-presence-stack-dot
      />
    </span>
  );
};

/**
 * Overlapping live-presence avatars showing who is in the canvas right
 * now. Each avatar carries an accent color, an initial, and a status
 * dot. Distinct from `AvatarGroup` (a static participant grouping):
 * this primitive centers on live status, a sane overflow, and
 * interactive expansion.
 *
 * Pure presentation; the host owns the websocket roster + maps user
 * ids to colors.
 *
 * @example
 * ```tsx
 * <PresenceStack
 *   max={4}
 *   users={[
 *     { id: "1", initial: "B", color: "#5b8def", name: "Bea" },
 *     { id: "2", initial: "L", color: "#10b981", name: "Lior", status: "away" },
 *     { id: "3", initial: "S", color: "#f59e0b", name: "Sam", status: "idle" },
 *   ]}
 *   onOverflowActivate={() => openRoster()}
 * />
 * ```
 *
 * @public
 */
export const PresenceStack = forwardRef<HTMLDivElement, PresenceStackProps>(
  (props, ref) => {
    const {
      className,
      labels,
      max = 5,
      onOverflowActivate,
      users,
      ...rest
    } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const visible = max >= users.length ? users : users.slice(0, max);
    const hidden = users.length - visible.length;
    const handleOverflow = (): void => {
      onOverflowActivate?.();
    };
    return (
      <div
        aria-label={resolvedLabels.region}
        className={cn("inline-flex items-center pl-2", className)}
        data-presence-stack
        ref={ref}
        role="group"
        {...rest}
      >
        {visible.map((user) => (
          <Avatar key={user.id} user={user} />
        ))}
        {hidden > 0
          ? renderOverflow({
              count: hidden,
              handleClick: handleOverflow,
              handlerProvided: Boolean(onOverflowActivate),
              labels: resolvedLabels,
            })
          : null}
      </div>
    );
  },
);
PresenceStack.displayName = "PresenceStack";

const renderOverflow = (input: {
  count: number;
  handleClick: () => void;
  handlerProvided: boolean;
  labels: Required<PresenceStackLabels>;
}): React.ReactElement => {
  const text = `+${input.count}`;
  const aria = `${input.count} ${input.labels.overflowSuffix}`;
  const className =
    "relative -ml-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-background bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground shadow-sm";
  if (input.handlerProvided) {
    return (
      <button
        aria-label={aria}
        className={cn(
          className,
          "transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        data-presence-stack-overflow
        onClick={input.handleClick}
        type="button"
      >
        {text}
      </button>
    );
  }
  return (
    <span aria-label={aria} className={className} data-presence-stack-overflow>
      {text}
    </span>
  );
};
