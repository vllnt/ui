"use client";

import { useTranslations } from "next-intl";

import { IssueForm, type IssueFormValues } from "@/components/issue-form";

const REPO = "vllnt/ui";

function buildIssueUrl({
  actual = "",
  component = "",
  expected = "",
  repro = "",
  summary = "",
}: IssueFormValues): string {
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

const FIELDS = [
  { name: "component" },
  { name: "summary", required: true },
  { multiline: true, name: "repro", required: true, rows: 4 },
  { multiline: true, name: "expected", required: true },
  { multiline: true, name: "actual", required: true, rows: 4 },
];

export function ReportBugForm({
  initialComponent = "",
}: {
  initialComponent?: string;
}) {
  const t = useTranslations("forms.report");

  return (
    <IssueForm
      buildIssueUrl={buildIssueUrl}
      fields={FIELDS}
      initialValues={{ component: initialComponent }}
      t={t}
    />
  );
}
