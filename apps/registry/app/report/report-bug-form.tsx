"use client";

import type * as React from "react";
import { useState } from "react";

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

  const params = new URLSearchParams({
    template: "bug_report.yml",
    title: `${titleSlug}${summary || "bug summary"}`,
    body,
    labels: component ? `bug,component:${component}` : "bug",
  });

  return `https://github.com/${REPO}/issues/new?${params.toString()}`;
}

function Field({
  autoFocus,
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  autoFocus?: boolean;
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
        autoFocus={autoFocus}
        className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function useInitialState<T>(initialValue: T) {
  return useState(initialValue);
}

export function ReportBugForm({
  initialComponent = "",
}: {
  initialComponent?: string;
}) {
  const [component, setComponent] = useInitialState(initialComponent);
  const [summary, setSummary] = useState("");
  const [repro, setRepro] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = buildIssueUrl({ actual, component, expected, repro, summary });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field
        label="Component (optional)"
        onChange={setComponent}
        placeholder="e.g. button, combobox, ai-chat-input"
        value={component}
      />
      <Field
        autoFocus
        label="One-line summary"
        onChange={setSummary}
        placeholder="Concise headline for the issue title."
        required
        value={summary}
      />
      <TextField
        label="Reproduction"
        onChange={setRepro}
        placeholder="Minimal repo / sandbox link / runnable snippet."
        required
        rows={4}
        value={repro}
      />
      <TextField
        label="Expected behavior"
        onChange={setExpected}
        placeholder="What you expected to happen."
        required
        value={expected}
      />
      <TextField
        label="Actual behavior"
        onChange={setActual}
        placeholder="What actually happened. Include console output or screenshots if useful."
        required
        rows={4}
        value={actual}
      />
      <button
        className="inline-flex h-10 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
        type="submit"
      >
        Open prefilled GitHub issue
      </button>
      <p className="text-xs text-muted-foreground">
        Submitting opens a new GitHub issue tab. Nothing is sent to a server.
      </p>
    </form>
  );
}
