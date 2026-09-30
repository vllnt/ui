"use client";

import { useState } from "react";

import type * as React from "react";

export type IssueFormField = {
  readonly multiline?: boolean;
  /** Field id; labels come from `<name>Label` / `<name>Placeholder` messages. */
  readonly name: string;
  readonly required?: boolean;
  /** Textarea height; ignored for single-line fields. */
  readonly rows?: number;
};

export type IssueFormValues = Readonly<Record<string, string>>;

const FIELD_CLASS_NAME =
  "mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

/**
 * Form that opens a prefilled GitHub issue in a new tab. `t` resolves the
 * field copy plus the `submit` and `note` messages.
 */
export function IssueForm({
  buildIssueUrl,
  fields,
  initialValues = {},
  t,
}: {
  readonly buildIssueUrl: (values: IssueFormValues) => string;
  readonly fields: readonly IssueFormField[];
  readonly initialValues?: IssueFormValues;
  readonly t: (key: string) => string;
}) {
  const [values, setValues] = useState<IssueFormValues>(initialValues);

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    window.open(buildIssueUrl(values), "_blank", "noopener,noreferrer");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {fields.map(({ multiline, name, required, rows = 3 }) => {
        const value = values[name] ?? "";
        const onChange = (
          event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => {
          setValues((current) => ({ ...current, [name]: event.target.value }));
        };
        return (
          <label className="block" key={name}>
            <span className="text-sm font-medium">
              {t(`${name}Label`)}
              {required ? (
                <span className="ml-1 text-destructive">*</span>
              ) : null}
            </span>
            {multiline ? (
              <textarea
                className={FIELD_CLASS_NAME}
                onChange={onChange}
                placeholder={t(`${name}Placeholder`)}
                required={required}
                rows={rows}
                value={value}
              />
            ) : (
              <input
                className={FIELD_CLASS_NAME}
                onChange={onChange}
                placeholder={t(`${name}Placeholder`)}
                required={required}
                type="text"
                value={value}
              />
            )}
          </label>
        );
      })}
      <button
        className="inline-flex h-10 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
        type="submit"
      >
        {t("submit")}
      </button>
      <p className="text-xs text-muted-foreground">{t("note")}</p>
    </form>
  );
}
