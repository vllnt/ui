"use client";

import * as React from "react";

import { cva } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../atoms/avatar/avatar";
import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../atoms/select/select";
import { Separator } from "../../atoms/separator/separator";

/** Panel to display: the people with access, or the invite form. */
export type ShareDialogPeopleKind = "invite" | "list";

/** Density of the panel: `desktop` is roomy, `phone` is compact. */
export type ShareDialogPeopleLayout = "desktop" | "phone";

/** One person who has access. */
export type ShareDialogPeoplePerson = {
  avatarSrc?: string;
  email?: string;
  id: string;
  name: string;
  /** The `value` of the person's current role in `roles`. */
  role: string;
};

/** A role a person can hold. */
export type ShareDialogPeopleRole = {
  label: string;
  value: string;
};

/** Every visible and screen-reader string of the panel. */
export type ShareDialogPeopleLabels = {
  back: string;
  close: string;
  copyLink: string;
  done: string;
  emailInput: string;
  emailPlaceholder: string;
  empty: string;
  invite: string;
  inviteRole: string;
  linkInput: string;
  note: string;
  peopleList: string;
  personRole: (name: string) => string;
  remove: string;
  send: string;
};

/** Props of {@link ShareDialogPeople}. */
export type ShareDialogPeopleProps = Omit<
  React.ComponentPropsWithoutRef<"section">,
  "aria-labelledby" | "role" | "title"
> & {
  /** Panel to display. The host owns it and updates it from `onKindChange`. */
  kind?: ShareDialogPeopleKind;
  /** Overrides for the English default strings. */
  labels?: Partial<ShareDialogPeopleLabels>;
  layout?: ShareDialogPeopleLayout;
  /** Share link for the link row. Without it, the row does not render. */
  linkUrl?: string;
  /** Renders the close button when set. */
  onClose?: () => void;
  onCopyLink?: () => void;
  onDone?: () => void;
  /** Called with the trimmed email and the chosen role on Send. */
  onInvite?: (email: string, role: string) => void;
  /** Called with `"invite"` by the Invite button and `"list"` by Back. */
  onKindChange?: (kind: ShareDialogPeopleKind) => void;
  /** Adds a Remove choice to every person's role menu when set. */
  onRemove?: (id: string) => void;
  onRoleChange?: (id: string, role: string) => void;
  people: ShareDialogPeoplePerson[];
  roles: ShareDialogPeopleRole[];
  title?: string;
};

const REMOVE_VALUE = "__remove__";

const DEFAULT_LABELS: ShareDialogPeopleLabels = {
  back: "Back",
  close: "Close",
  copyLink: "Copy link",
  done: "Done",
  emailInput: "Email address",
  emailPlaceholder: "name@example.com",
  empty: "No one has access yet.",
  invite: "Invite",
  inviteRole: "Role for the new person",
  linkInput: "Share link",
  note: "Invited people get an email with a link.",
  peopleList: "People with access",
  personRole: (name) => `${name} role`,
  remove: "Remove",
  send: "Send",
};

const panelVariants = cva(
  "flex w-full flex-col rounded-lg border bg-card text-card-foreground",
  {
    defaultVariants: { layout: "desktop" },
    variants: {
      layout: {
        desktop: "max-w-lg gap-4 p-6",
        phone: "max-w-sm gap-3 p-4",
      },
    },
  },
);

const stackVariants = cva("flex flex-col", {
  defaultVariants: { layout: "desktop" },
  variants: {
    layout: {
      desktop: "gap-4",
      phone: "gap-3",
    },
  },
});

const actionsVariants = cva("flex gap-2", {
  defaultVariants: { layout: "desktop" },
  variants: {
    layout: {
      desktop: "flex-row justify-end",
      phone: "flex-col-reverse [&>button]:w-full",
    },
  },
});

const avatarVariants = cva("", {
  defaultVariants: { layout: "desktop" },
  variants: {
    layout: {
      desktop: "size-10",
      phone: "size-8 text-xs",
    },
  },
});

const roleTriggerVariants = cva("shrink-0", {
  defaultVariants: { layout: "desktop" },
  variants: {
    layout: {
      desktop: "w-36",
      phone: "h-9 w-28",
    },
  },
});

type Layout = { layout: ShareDialogPeopleLayout };

type Labelled = { labels: ShareDialogPeopleLabels };

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

function getRoleLabel(roles: ShareDialogPeopleRole[], value: string): string {
  return roles.find((role) => role.value === value)?.label ?? value;
}

function RoleItems({
  roles,
}: {
  roles: ShareDialogPeopleRole[];
}): React.JSX.Element {
  return (
    <>
      {roles.map((role) => (
        <SelectItem key={role.value} value={role.value}>
          {role.label}
        </SelectItem>
      ))}
    </>
  );
}

function PanelHeader({
  labels,
  onClose,
  title,
  titleId,
}: Labelled & {
  onClose?: () => void;
  title: string;
  titleId: string;
}): React.JSX.Element {
  const handleClose = (): void => {
    onClose?.();
  };

  return (
    <header className="flex items-center justify-between gap-3">
      <h2
        className="text-lg font-semibold leading-none tracking-tight"
        id={titleId}
      >
        {title}
      </h2>
      {onClose ? (
        <Button
          className="-mr-2 shrink-0"
          onClick={handleClose}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X aria-hidden="true" />
          <span className="sr-only">{labels.close}</span>
        </Button>
      ) : null}
    </header>
  );
}

function LinkRow({
  labels,
  linkUrl,
  onCopyLink,
}: Labelled & {
  linkUrl: string;
  onCopyLink?: () => void;
}): React.JSX.Element {
  const handleCopy = (): void => {
    onCopyLink?.();
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        aria-label={labels.linkInput}
        className="min-w-0 flex-1"
        readOnly
        value={linkUrl}
      />
      <Button
        className="shrink-0"
        onClick={handleCopy}
        type="button"
        variant="outline"
      >
        {labels.copyLink}
      </Button>
    </div>
  );
}

function PersonEntry({
  labels,
  layout,
  onRemove,
  onRoleChange,
  person,
  roles,
}: Labelled &
  Layout & {
    onRemove?: (id: string) => void;
    onRoleChange?: (id: string, role: string) => void;
    person: ShareDialogPeoplePerson;
    roles: ShareDialogPeopleRole[];
  }): React.JSX.Element {
  const handleValueChange = (value: string): void => {
    if (value === REMOVE_VALUE) {
      onRemove?.(person.id);
      return;
    }
    onRoleChange?.(person.id, value);
  };

  return (
    <li className="flex items-center gap-3">
      <Avatar className={avatarVariants({ layout })}>
        {person.avatarSrc ? (
          <AvatarImage alt="" src={person.avatarSrc} />
        ) : null}
        <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{person.name}</p>
        {person.email ? (
          <p className="truncate text-xs text-muted-foreground">
            {person.email}
          </p>
        ) : null}
      </div>
      <Select onValueChange={handleValueChange} value={person.role}>
        <SelectTrigger
          aria-label={labels.personRole(person.name)}
          className={roleTriggerVariants({ layout })}
        >
          <SelectValue>{getRoleLabel(roles, person.role)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <RoleItems roles={roles} />
          {onRemove ? (
            <>
              <SelectSeparator className="my-1" />
              <SelectItem
                className="text-destructive focus:text-destructive"
                value={REMOVE_VALUE}
              >
                {labels.remove}
              </SelectItem>
            </>
          ) : null}
        </SelectContent>
      </Select>
    </li>
  );
}

function PeopleList({
  labels,
  layout,
  onRemove,
  onRoleChange,
  people,
  roles,
}: Labelled &
  Layout & {
    onRemove?: (id: string) => void;
    onRoleChange?: (id: string, role: string) => void;
    people: ShareDialogPeoplePerson[];
    roles: ShareDialogPeopleRole[];
  }): React.JSX.Element {
  if (people.length === 0) {
    return <p className="text-sm text-muted-foreground">{labels.empty}</p>;
  }

  return (
    <ul aria-label={labels.peopleList} className="flex flex-col gap-3">
      {people.map((person) => (
        <PersonEntry
          key={person.id}
          labels={labels}
          layout={layout}
          onRemove={onRemove}
          onRoleChange={onRoleChange}
          person={person}
          roles={roles}
        />
      ))}
    </ul>
  );
}

function ListView({
  labels,
  layout,
  linkUrl,
  onCopyLink,
  onDone,
  onKindChange,
  onRemove,
  onRoleChange,
  people,
  roles,
}: Labelled &
  Layout & {
    linkUrl?: string;
    onCopyLink?: () => void;
    onDone?: () => void;
    onKindChange?: (kind: ShareDialogPeopleKind) => void;
    onRemove?: (id: string) => void;
    onRoleChange?: (id: string, role: string) => void;
    people: ShareDialogPeoplePerson[];
    roles: ShareDialogPeopleRole[];
  }): React.JSX.Element {
  const handleInvite = (): void => {
    onKindChange?.("invite");
  };
  const handleDone = (): void => {
    onDone?.();
  };

  return (
    <>
      <div className={stackVariants({ layout })}>
        {linkUrl ? (
          <>
            <LinkRow
              labels={labels}
              linkUrl={linkUrl}
              onCopyLink={onCopyLink}
            />
            <Separator />
          </>
        ) : null}
        <PeopleList
          labels={labels}
          layout={layout}
          onRemove={onRemove}
          onRoleChange={onRoleChange}
          people={people}
          roles={roles}
        />
      </div>
      <div className={actionsVariants({ layout })}>
        <Button onClick={handleInvite} type="button" variant="outline">
          {labels.invite}
        </Button>
        <Button onClick={handleDone} type="button">
          {labels.done}
        </Button>
      </div>
    </>
  );
}

function InviteForm({
  labels,
  layout,
  onInvite,
  onKindChange,
  roles,
}: Labelled &
  Layout & {
    onInvite?: (email: string, role: string) => void;
    onKindChange?: (kind: ShareDialogPeopleKind) => void;
    roles: ShareDialogPeopleRole[];
  }): React.JSX.Element {
  const noteId = React.useId();
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState(roles[0]?.value ?? "");

  const handleEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setEmail(event.target.value);
  };
  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onInvite?.(email.trim(), role);
  };
  const handleBack = (): void => {
    onKindChange?.("list");
  };

  return (
    <form className={stackVariants({ layout })} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            aria-describedby={noteId}
            aria-label={labels.emailInput}
            autoComplete="email"
            className="min-w-0 flex-1"
            onChange={handleEmailChange}
            placeholder={labels.emailPlaceholder}
            required
            type="email"
            value={email}
          />
          <Select onValueChange={setRole} value={role}>
            <SelectTrigger
              aria-label={labels.inviteRole}
              className={roleTriggerVariants({ layout })}
            >
              <SelectValue>{getRoleLabel(roles, role)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <RoleItems roles={roles} />
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground" id={noteId}>
          {labels.note}
        </p>
      </div>
      <div className={actionsVariants({ layout })}>
        <Button onClick={handleBack} type="button" variant="outline">
          {labels.back}
        </Button>
        <Button type="submit">{labels.send}</Button>
      </div>
    </form>
  );
}

/**
 * Content panel of a people-sharing dialog: a share link, the people who have
 * access with a role menu each, and an invite form. The host wraps it in a
 * `Dialog` or `Sheet` and owns `kind`, the people and every side effect.
 */
export const ShareDialogPeople = ({
  className,
  kind = "list",
  labels: labelOverrides,
  layout = "desktop",
  linkUrl,
  onClose,
  onCopyLink,
  onDone,
  onInvite,
  onKindChange,
  onRemove,
  onRoleChange,
  people,
  ref: reference,
  roles,
  title = "Share",
  ...props
}: ShareDialogPeopleProps & {
  ref?: React.Ref<HTMLElement>;
}): React.JSX.Element => {
  const titleId = React.useId();
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };

  return (
    <section
      {...props}
      aria-labelledby={titleId}
      className={cn(panelVariants({ layout }), className)}
      data-kind={kind}
      data-layout={layout}
      ref={reference}
      role="group"
    >
      <PanelHeader
        labels={labels}
        onClose={onClose}
        title={title}
        titleId={titleId}
      />
      {kind === "invite" ? (
        <InviteForm
          labels={labels}
          layout={layout}
          onInvite={onInvite}
          onKindChange={onKindChange}
          roles={roles}
        />
      ) : (
        <ListView
          labels={labels}
          layout={layout}
          linkUrl={linkUrl}
          onCopyLink={onCopyLink}
          onDone={onDone}
          onKindChange={onKindChange}
          onRemove={onRemove}
          onRoleChange={onRoleChange}
          people={people}
          roles={roles}
        />
      )}
    </section>
  );
};

ShareDialogPeople.displayName = "ShareDialogPeople";
