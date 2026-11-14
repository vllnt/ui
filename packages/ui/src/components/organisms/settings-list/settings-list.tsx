"use client";

import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRight } from "lucide-react";

import { cn } from "../../../lib/utils";
import { itemVariants } from "../../atoms/item/item";

const settingsListVariants = cva("w-full", {
  defaultVariants: {
    variant: "inset-grouped",
  },
  variants: {
    variant: {
      "inset-grouped":
        "overflow-hidden rounded-lg border bg-card text-card-foreground",
      plain: "",
    },
  },
});

const interactiveRowClasses =
  "cursor-pointer text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none";

/** Surface style of a `SettingsList` (Penpot axis `Style`). */
export type SettingsListVariant = NonNullable<
  VariantProps<typeof settingsListVariants>["variant"]
>;

/** Props for `SettingsList`. `title` labels the section for assistive tech. */
export type SettingsListProps = Omit<
  React.ComponentPropsWithoutRef<"section">,
  "title"
> &
  VariantProps<typeof settingsListVariants> & {
    description?: React.ReactNode;
    title?: React.ReactNode;
  };

/** ARIA props `SettingsListItem` injects into its `control` element. */
export type SettingsListControlProps = {
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
};

type SettingsListItemBaseProps = Omit<
  React.ComponentPropsWithoutRef<"li">,
  "children" | "onClick"
> & {
  description?: React.ReactNode;
  label: React.ReactNode;
  leading?: React.ReactNode;
  meta?: React.ReactNode;
};

type SettingsListItemTrailingProps =
  | { chevron?: boolean; control?: never; href: string; onClick?: never }
  | {
      chevron?: boolean;
      control?: never;
      href?: never;
      onClick: React.MouseEventHandler<HTMLButtonElement>;
    }
  | {
      chevron?: never;
      control: React.ReactElement<SettingsListControlProps>;
      href?: never;
      onClick?: never;
    }
  | { chevron?: never; control?: never; href?: never; onClick?: never };

/**
 * Props for `SettingsListItem`. A row has at most one trailing control: a
 * `control` element (for example a `Switch`), or `href` / `onClick` with an
 * optional `chevron`. The union rejects every other combination.
 */
export type SettingsListItemProps = SettingsListItemBaseProps &
  SettingsListItemTrailingProps;

type SettingsListRowShellProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

function SettingsListRowShell({
  children,
  href,
  onClick,
}: SettingsListRowShellProps): React.JSX.Element {
  const rowClassName = cn(itemVariants(), "w-full px-4 py-3");

  if (href !== undefined) {
    return (
      <a className={cn(rowClassName, interactiveRowClasses)} href={href}>
        {children}
      </a>
    );
  }
  if (onClick !== undefined) {
    return (
      <button
        className={cn(rowClassName, interactiveRowClasses)}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    );
  }
  return <div className={rowClassName}>{children}</div>;
}

/**
 * Settings section: an optional heading and description above a list of rows.
 * The root is a `<section>` labelled by `title`; rows are `<li>` elements of a
 * `<ul role="list">` separated by CSS dividers.
 *
 * @example
 * <SettingsList title="Account" variant="inset-grouped">
 *   <SettingsListItem label="Notifications" control={<Switch />} />
 * </SettingsList>
 */
export const SettingsList = ({
  children,
  className,
  description,
  ref: reference,
  title,
  variant,
  ...props
}: SettingsListProps & { ref?: React.Ref<HTMLElement> }) => {
  const baseId = React.useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  return (
    <section
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={title ? titleId : undefined}
      className={cn(settingsListVariants({ variant }), className)}
      data-slot="settings-list"
      ref={reference}
      {...props}
    >
      {title || description ? (
        <header className="flex flex-col gap-1 border-b px-4 py-3">
          {title ? (
            <h2 className="text-sm font-semibold" id={titleId}>
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground" id={descriptionId}>
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      <ul className="divide-y divide-border">{children}</ul>
    </section>
  );
};

SettingsList.displayName = "SettingsList";

/**
 * One row of a `SettingsList`: label, optional description, leading icon or
 * avatar, right-side value and one trailing control. A `control` element is
 * labelled by the row label and described by the row description. `href`
 * renders a link and `onClick` a button, both with a visible focus ring.
 *
 * @example
 * <SettingsListItem label="Language" meta="English" href="/language" />
 */
export const SettingsListItem = ({
  chevron,
  className,
  control,
  description,
  href,
  label,
  leading,
  meta,
  onClick,
  ref: reference,
  ...props
}: SettingsListItemProps & { ref?: React.Ref<HTMLLIElement> }) => {
  const baseId = React.useId();
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const isInteractive = href !== undefined || onClick !== undefined;
  const showChevron = isInteractive && chevron !== false;

  return (
    <li
      className={className}
      data-slot="settings-list-item"
      ref={reference}
      {...props}
    >
      <SettingsListRowShell href={href} onClick={onClick}>
        {leading ? (
          <span className="flex shrink-0 items-center justify-center [&_svg]:size-5">
            {leading}
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-medium" id={labelId}>
            {label}
          </span>
          {description ? (
            <span className="text-muted-foreground" id={descriptionId}>
              {description}
            </span>
          ) : null}
        </span>
        {meta ? (
          <span className="max-w-32 shrink-0 text-right text-muted-foreground">
            {meta}
          </span>
        ) : null}
        {control === undefined
          ? null
          : React.cloneElement(control, {
              "aria-describedby":
                control.props["aria-describedby"] ??
                (description ? descriptionId : undefined),
              "aria-labelledby": control.props["aria-labelledby"] ?? labelId,
            })}
        {showChevron ? (
          <ChevronRight
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        ) : null}
      </SettingsListRowShell>
    </li>
  );
};

SettingsListItem.displayName = "SettingsListItem";
