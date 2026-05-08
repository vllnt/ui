"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * One presence chip in the stack.
 *
 * @public
 */
export type PresenceMember = {
  /** Optional color theme. Falls back to a deterministic palette stop. */
  color?: "amber" | "blue" | "emerald" | "purple" | "red" | "rose";
  /** Stable identifier (used as React key). */
  id: string;
  /** Display name for the tooltip + screen reader. */
  name: string;
  /** Optional avatar URL. */
  src?: string;
  /** Live status. Defaults to `"active"`. */
  status?: "active" | "away" | "idle";
};

const FALLBACK_COLORS = [
  "amber",
  "blue",
  "emerald",
  "purple",
  "red",
  "rose",
] as const;

const COLOR_BG: Record<NonNullable<PresenceMember["color"]>, string> = {
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
  rose: "bg-rose-500",
};

const STATUS_DOT: Record<NonNullable<PresenceMember["status"]>, string> = {
  active: "bg-emerald-500",
  away: "bg-amber-500",
  idle: "bg-muted-foreground",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type PresenceStackLabels = {
  /** Aria-label for the stack. Defaults to `"Live participants"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Live participants",
} as const satisfies Required<PresenceStackLabels>;

/**
 * Props for {@link PresenceStack}.
 *
 * @public
 */
export type PresenceStackProps = {
  /** Localizable strings. */
  labels?: PresenceStackLabels;
  /** Top number of chips to render before collapsing the rest into a `+N` chip. Defaults to `4`. */
  max?: number;
  /** Live participants. */
  members: PresenceMember[];
  /** Optional click handler — fires after a chip click. */
  onSelect?: (member: PresenceMember) => void;
} & ComponentPropsWithoutRef<"div">;

function fallbackColor(id: string): NonNullable<PresenceMember["color"]> {
  const hash = Array.from({ length: id.length }).reduce<number>(
    (accumulator, _, index_) =>
      (accumulator * 31 + (id.codePointAt(index_) ?? 0)) >>> 0,
    0,
  );
  const index = hash % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[index] ?? "blue";
}

function initials(name: string): string {
  return name
    .split(/\s+/u)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

type ChipProps = {
  member: PresenceMember;
  onSelect?: (member: PresenceMember) => void;
};

function Chip({ member, onSelect }: ChipProps): ReactNode {
  const color = member.color ?? fallbackColor(member.id);
  const status = member.status ?? "active";
  const isInteractive = Boolean(onSelect);
  const Element = isInteractive ? "button" : "span";
  return (
    <Element
      aria-label={member.name}
      className={cn(
        "relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-visible rounded-full border-2 border-background ring-0 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isInteractive ? "cursor-pointer" : "cursor-default",
      )}
      data-member-id={member.id}
      data-presence-status={status}
      onClick={isInteractive ? () => onSelect?.(member) : undefined}
      type={isInteractive ? "button" : undefined}
    >
      {member.src ? (
        <img
          alt=""
          className="h-full w-full rounded-full object-cover"
          src={member.src}
        />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full text-[10px] font-semibold text-white",
            COLOR_BG[color],
          )}
        >
          {initials(member.name)}
        </span>
      )}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
          STATUS_DOT[status],
        )}
      />
    </Element>
  );
}

/**
 * Compact stack of overlapping avatar chips for live participants on a
 * canvas. Use over a generic `AvatarGroup` when you need live presence
 * status (active / away / idle) and click-to-focus per member.
 *
 * @example
 * ```tsx
 * <PresenceStack
 *   members={[
 *     { id: "sam", name: "Sam", color: "emerald" },
 *     { id: "riley", name: "Riley", status: "idle" },
 *     { id: "wei", name: "Wei", color: "rose" },
 *   ]}
 *   onSelect={(member) => focusOn(member.id)}
 * />
 * ```
 *
 * @public
 */
export const PresenceStack = forwardRef<HTMLDivElement, PresenceStackProps>(
  (props, ref) => {
    const { className, labels, max = 4, members, onSelect, ...rest } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const visible = members.slice(0, max);
    const overflow = Math.max(0, members.length - visible.length);
    return (
      <div
        aria-label={resolvedLabels.region}
        className={cn("inline-flex items-center -space-x-2", className)}
        data-presence-count={members.length}
        ref={ref}
        role="group"
        {...rest}
      >
        {visible.map((member) => (
          <Chip key={member.id} member={member} onSelect={onSelect} />
        ))}
        {overflow > 0 ? (
          <span
            aria-label={`${overflow.toString()} more`}
            className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-background bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground"
            data-overflow={overflow}
          >
            {`+${overflow.toString()}`}
          </span>
        ) : null}
      </div>
    );
  },
);
PresenceStack.displayName = "PresenceStack";
