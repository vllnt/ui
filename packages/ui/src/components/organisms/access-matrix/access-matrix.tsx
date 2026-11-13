"use client";

import * as React from "react";

import { cva } from "class-variance-authority";
import { Check, CornerDownRight, type LucideIcon, X } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../atoms/table/table";

/** What one subject holds for one permission. */
export type AccessMatrixState = "denied" | "granted" | "inherited";

/** `grid` renders a real table, `list` renders one entry per subject. */
export type AccessMatrixMode = "grid" | "list";

/** A row of the matrix: who or what holds the permissions. */
export type AccessMatrixSubject = {
  description?: string;
  id: string;
  label: string;
};

/** A column of the matrix: one permission. */
export type AccessMatrixPermission = {
  id: string;
  label: string;
};

/** Subject id, then permission id, then state. A missing entry reads as `denied`. */
export type AccessMatrixValue = Record<
  string,
  Record<string, AccessMatrixState>
>;

/** The word shown and announced for each state. */
export type AccessMatrixLabels = Record<AccessMatrixState, string>;

/** Called with the state a cell asks for. Inherited cells never call it. */
export type AccessMatrixChangeHandler = (
  subjectId: string,
  permissionId: string,
  next: "denied" | "granted",
) => void;

export type AccessMatrixProps = Omit<
  React.ComponentPropsWithoutRef<"section">,
  "onChange" | "title"
> & {
  labels?: Partial<AccessMatrixLabels>;
  mode?: AccessMatrixMode;
  onChange?: AccessMatrixChangeHandler;
  permissions: AccessMatrixPermission[];
  subjects: AccessMatrixSubject[];
  title?: string;
  value: AccessMatrixValue;
};

type AccessMatrixBodyProps = {
  labelledBy?: string;
  labels: AccessMatrixLabels;
  onChange?: AccessMatrixChangeHandler;
  permissions: AccessMatrixPermission[];
  subjects: AccessMatrixSubject[];
  value: AccessMatrixValue;
};

type AccessMatrixHeaderProps = {
  inheritedLabel: string;
  showInherited: boolean;
  title?: string;
  titleId: string;
};

type MatrixCellProps = Pick<
  AccessMatrixBodyProps,
  "labels" | "onChange" | "value"
> & {
  permission: AccessMatrixPermission;
  showWord: boolean;
  subject: AccessMatrixSubject;
};

type StateControlProps = {
  framed: boolean;
  label: string;
  onToggle?: () => void;
  permissionLabel: string;
  showWord: boolean;
  state: AccessMatrixState;
  subjectLabel: string;
};

const DEFAULT_LABELS: AccessMatrixLabels = {
  denied: "Denied",
  granted: "Granted",
  inherited: "Inherited",
};

const STATE_ICONS: Record<AccessMatrixState, LucideIcon> = {
  denied: X,
  granted: Check,
  inherited: CornerDownRight,
};

const accessMatrixStateVariants = cva(
  "inline-flex items-center justify-center gap-1.5 text-sm font-medium",
  {
    defaultVariants: {
      state: "denied",
    },
    variants: {
      state: {
        denied: "text-muted-foreground",
        granted: "text-success",
        inherited: "text-info",
      },
    },
  },
);

function resolveLabels(
  labels: Partial<AccessMatrixLabels> | undefined,
): AccessMatrixLabels {
  return {
    denied: labels?.denied ?? DEFAULT_LABELS.denied,
    granted: labels?.granted ?? DEFAULT_LABELS.granted,
    inherited: labels?.inherited ?? DEFAULT_LABELS.inherited,
  };
}

function getState(
  value: AccessMatrixValue,
  subjectId: string,
  permissionId: string,
): AccessMatrixState {
  return value[subjectId]?.[permissionId] ?? "denied";
}

function StateControl({
  framed,
  label,
  onToggle,
  permissionLabel,
  showWord,
  state,
  subjectLabel,
}: StateControlProps): React.JSX.Element {
  const Icon = STATE_ICONS[state];
  const content = (
    <span
      className={cn(
        accessMatrixStateVariants({ state }),
        !onToggle && framed && (showWord ? "h-9 px-3" : "size-10"),
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className={cn(!showWord && "sr-only")}>{label}</span>
    </span>
  );

  if (!onToggle) {
    return content;
  }

  return (
    <Button
      aria-label={`${subjectLabel}, ${permissionLabel}: ${label}`}
      onClick={onToggle}
      size={showWord ? "sm" : "icon"}
      type="button"
      variant="ghost"
    >
      {content}
    </Button>
  );
}

function MatrixCell({
  labels,
  onChange,
  permission,
  showWord,
  subject,
  value,
}: MatrixCellProps): React.JSX.Element {
  const state = getState(value, subject.id, permission.id);
  const next = state === "granted" ? "denied" : "granted";
  const isEditable = onChange !== undefined && state !== "inherited";

  return (
    <StateControl
      framed={onChange !== undefined}
      label={labels[state]}
      onToggle={
        isEditable
          ? () => {
              onChange(subject.id, permission.id, next);
            }
          : undefined
      }
      permissionLabel={permission.label}
      showWord={showWord}
      state={state}
      subjectLabel={subject.label}
    />
  );
}

function SubjectText({
  subject,
}: {
  subject: AccessMatrixSubject;
}): React.JSX.Element {
  return (
    <>
      <span className="block text-sm font-medium text-foreground">
        {subject.label}
      </span>
      {subject.description ? (
        <span className="block text-xs font-normal text-muted-foreground">
          {subject.description}
        </span>
      ) : null}
    </>
  );
}

function AccessMatrixGrid({
  labelledBy,
  labels,
  onChange,
  permissions,
  subjects,
  value,
}: AccessMatrixBodyProps): React.JSX.Element {
  return (
    <Table aria-labelledby={labelledBy}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableCell />
          {permissions.map((permission) => (
            <TableHead className="text-center" key={permission.id} scope="col">
              {permission.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((subject) => (
          <TableRow key={subject.id}>
            <TableHead className="h-auto py-3 text-foreground" scope="row">
              <SubjectText subject={subject} />
            </TableHead>
            {permissions.map((permission) => (
              <TableCell className="text-center" key={permission.id}>
                <MatrixCell
                  labels={labels}
                  onChange={onChange}
                  permission={permission}
                  showWord={false}
                  subject={subject}
                  value={value}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function AccessMatrixList({
  labelledBy,
  labels,
  onChange,
  permissions,
  subjects,
  value,
}: AccessMatrixBodyProps): React.JSX.Element {
  return (
    <ul aria-labelledby={labelledBy} className="divide-y">
      {subjects.map((subject) => (
        <li className="space-y-3 px-4 py-3" key={subject.id}>
          <div>
            <SubjectText subject={subject} />
          </div>
          <ul className="space-y-1">
            {permissions.map((permission) => (
              <li
                className="flex items-center justify-between gap-3 text-sm"
                key={permission.id}
              >
                <span className="text-muted-foreground">
                  {permission.label}
                </span>
                <MatrixCell
                  labels={labels}
                  onChange={onChange}
                  permission={permission}
                  showWord
                  subject={subject}
                  value={value}
                />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function AccessMatrixHeader({
  inheritedLabel,
  showInherited,
  title,
  titleId,
}: AccessMatrixHeaderProps): null | React.JSX.Element {
  if (!title && !showInherited) {
    return null;
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
      {title ? (
        <h3
          className="text-base font-semibold leading-none tracking-tight"
          id={titleId}
        >
          {title}
        </h3>
      ) : null}
      {showInherited ? (
        <p
          aria-hidden="true"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <CornerDownRight className="size-3.5 shrink-0" />
          {inheritedLabel}
        </p>
      ) : null}
    </header>
  );
}

/**
 * Shows which permissions each subject holds, as a table (`grid`) or as one
 * list entry per subject (`list`). Each cell reads `granted`, `denied` or
 * `inherited`, with a glyph and a word. With `onChange`, granted and denied
 * cells become buttons that ask for the opposite state; inherited cells never
 * change. The host picks the mode and owns the value.
 */
export const AccessMatrix = ({
  className,
  labels,
  mode = "grid",
  onChange,
  permissions,
  ref: reference,
  subjects,
  title,
  value,
  ...props
}: AccessMatrixProps & {
  ref?: React.Ref<HTMLElement>;
}): React.JSX.Element => {
  const titleId = React.useId();
  const resolvedLabels = resolveLabels(labels);
  const hasEntries = subjects.length > 0 && permissions.length > 0;
  const hasInherited = subjects.some((subject) =>
    permissions.some(
      (permission) =>
        getState(value, subject.id, permission.id) === "inherited",
    ),
  );
  const bodyProps: AccessMatrixBodyProps = {
    labelledBy: title ? titleId : undefined,
    labels: resolvedLabels,
    onChange,
    permissions,
    subjects,
    value,
  };

  return (
    <section
      className={cn(
        "w-full rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      ref={reference}
      {...props}
    >
      <AccessMatrixHeader
        inheritedLabel={resolvedLabels.inherited}
        showInherited={hasInherited}
        title={title}
        titleId={titleId}
      />
      {hasEntries ? (
        mode === "list" ? (
          <AccessMatrixList {...bodyProps} />
        ) : (
          <AccessMatrixGrid {...bodyProps} />
        )
      ) : null}
    </section>
  );
};

AccessMatrix.displayName = "AccessMatrix";
