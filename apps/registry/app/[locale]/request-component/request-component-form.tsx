"use client";

import { useId, useState } from "react";

import { useTranslations } from "next-intl";
import type * as React from "react";

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

  const parameters = new URLSearchParams({
    body,
    labels: "enhancement,component",
    template: "feature_request.yml",
    title: `[feat] ${name || "new component"}`,
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
  const labelId = useId();

  return (
    <div>
      <span className="text-sm font-medium" id={labelId}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
        ) : null}
      </span>
      <input
        aria-labelledby={labelId}
        className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        required={required}
        type="text"
        value={value}
      />
    </div>
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
  const labelId = useId();

  return (
    <div>
      <span className="text-sm font-medium" id={labelId}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
        ) : null}
      </span>
      <textarea
        aria-labelledby={labelId}
        className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
      />
    </div>
  );
}

export function RequestComponentForm() {
  const t = useTranslations("forms.requestComponent");
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");
  const [similar, setSimilar] = useState("");
  const [useCase, setUseCase] = useState("");
  const [reference, setReference] = useState("");

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = buildIssueUrl({ name, problem, reference, similar, useCase });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field
        label={t("nameLabel")}
        onChange={setName}
        placeholder={t("namePlaceholder")}
        required
        value={name}
      />
      <TextField
        label={t("problemLabel")}
        onChange={setProblem}
        placeholder={t("problemPlaceholder")}
        required
        rows={3}
        value={problem}
      />
      <Field
        label={t("similarLabel")}
        onChange={setSimilar}
        placeholder={t("similarPlaceholder")}
        value={similar}
      />
      <TextField
        label={t("useCaseLabel")}
        onChange={setUseCase}
        placeholder={t("useCasePlaceholder")}
        rows={3}
        value={useCase}
      />
      <TextField
        label={t("referenceLabel")}
        onChange={setReference}
        placeholder={t("referencePlaceholder")}
        rows={3}
        value={reference}
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
