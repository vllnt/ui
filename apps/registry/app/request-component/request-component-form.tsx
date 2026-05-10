"use client";

import type * as React from "react";
import { useState } from "react";

const REPO = "vllnt/ui";

function buildIssueUrl({
  name,
  problem,
  reference,
  similar,
  useCase,
}: {
  name: string;
  problem: string;
  reference: string;
  similar: string;
  useCase: string;
}): string {
  const body = [
    "## What problem are you trying to solve?",
    "",
    problem || "_describe the user-facing need_",
    "",
    "## Proposed solution",
    "",
    name ? `Component: **${name}**` : "_component name_",
    "",
    similar ? `Similar to: ${similar}` : "",
    "",
    "## Use case",
    "",
    useCase || "_describe the concrete scenario_",
    "",
    "## References / prior art",
    "",
    reference || "_links, screenshots, design references_",
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    template: "feature_request.yml",
    title: `[feat] ${name || "new component"}`,
    body,
    labels: "enhancement,component",
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

export function RequestComponentForm() {
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");
  const [similar, setSimilar] = useState("");
  const [useCase, setUseCase] = useState("");
  const [reference, setReference] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = buildIssueUrl({ name, problem, reference, similar, useCase });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field
        autoFocus
        label="Component name"
        onChange={setName}
        placeholder="e.g. ToastStack"
        required
        value={name}
      />
      <TextField
        label="What problem does it solve?"
        onChange={setProblem}
        placeholder="The user-facing need, not the implementation."
        required
        rows={3}
        value={problem}
      />
      <Field
        label="Similar to (optional)"
        onChange={setSimilar}
        placeholder="shadcn Toast, Radix Toast, etc."
        value={similar}
      />
      <TextField
        label="Use case"
        onChange={setUseCase}
        placeholder="The concrete scenario where you'd reach for this."
        rows={3}
        value={useCase}
      />
      <TextField
        label="References / prior art (optional)"
        onChange={setReference}
        placeholder="Links, screenshots, design references…"
        rows={3}
        value={reference}
      />
      <button
        className="inline-flex h-10 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
        type="submit"
      >
        Open prefilled GitHub issue
      </button>
      <p className="text-xs text-muted-foreground">
        Submitting opens a new GitHub issue tab — nothing is sent to a server.
      </p>
    </form>
  );
}
