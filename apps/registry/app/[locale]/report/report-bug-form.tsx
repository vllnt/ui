"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import type * as React from "react";

const REPO = "vllnt/ui";

function buildIssueUrl({
  actual,
  component,
  expected,
  repro,
  summary,
}: {
  actual: string;
  component: string;
  expected: string;
  repro: string;
  summary: string;
}): string {
  const titleSlug = component ? `bug(${component}): ` : "[bug] ";
  const body = [
    component ? `Component: **${component}**` : "",
    "",
    "## Reproduction",
    "",
    repro || "_minimal repro / link / snippet_",
    "",
    "## Expected",
    "",
    expected || "_what you expected to happen_",
    "",
    "## Actual",
    "",
    actual || "_what actually happened — include console / screenshot_",
    "",
    "## Environment",
    "",
    "- VLLNT UI version: _e.g. 0.2.1_",
    "- Browser:",
    "- OS:",
    "- Node / pnpm:",
  ]
    .filter(Boolean)
    .join("\n");

  const parameters = new URLSearchParams({
    body,
    labels: component ? `bug,component:${component}` : "bug",
    template: "bug_report.yml",
    title: `${titleSlug}${summary || "bug summary"}`,
  });

  return `https://github.com/${REPO}/issues/new?${parameters.toString()}`;
}

function Field({
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </span>
      <input
        className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        required={required}
        type="text"
        value={value}
      />
    </label>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  required,
  rows = 3,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </span>
      <textarea
        className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
      />
    </label>
  );
}

export function ReportBugForm({
  initialComponent = "",
}: {
  initialComponent?: string;
}) {
  const t = useTranslations("forms.report");
  const [component, setComponent] = useState(initialComponent);
  const [summary, setSummary] = useState("");
  const [repro, setRepro] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = buildIssueUrl({ actual, component, expected, repro, summary });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field
        label={t("componentLabel")}
        onChange={setComponent}
        placeholder={t("componentPlaceholder")}
        value={component}
      />
      <Field
        label={t("summaryLabel")}
        onChange={setSummary}
        placeholder={t("summaryPlaceholder")}
        required
        value={summary}
      />
      <TextField
        label={t("reproLabel")}
        onChange={setRepro}
        placeholder={t("reproPlaceholder")}
        required
        rows={4}
        value={repro}
      />
      <TextField
        label={t("expectedLabel")}
        onChange={setExpected}
        placeholder={t("expectedPlaceholder")}
        required
        value={expected}
      />
      <TextField
        label={t("actualLabel")}
        onChange={setActual}
        placeholder={t("actualPlaceholder")}
        required
        rows={4}
        value={actual}
      />
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
