"use client";

import { useTranslations } from "next-intl";

import { IssueForm, type IssueFormValues } from "@/components/issue-form";

const REPO = "vllnt/ui";

function buildIssueUrl({
  name = "",
  problem = "",
  reference = "",
  similar = "",
  useCase = "",
}: IssueFormValues): string {
  const proposal = [
    name ? `Component: **${name}**` : "",
    useCase ? `Use case: ${useCase}` : "",
    reference ? `References / prior art: ${reference}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const parameters = new URLSearchParams({
    labels: "enhancement,component",
    template: "feature_request.yml",
    title: `[feat] ${name || "new component"}`,
  });
  if (problem) parameters.set("problem", problem);
  if (proposal) parameters.set("proposal", proposal);
  if (similar) parameters.set("alternatives", similar);

  return `https://github.com/${REPO}/issues/new?${parameters.toString()}`;
}

const FIELDS = [
  { name: "name", required: true },
  { multiline: true, name: "problem", required: true },
  { name: "similar" },
  { multiline: true, name: "useCase" },
  { multiline: true, name: "reference" },
];

export function RequestComponentForm() {
  const t = useTranslations("forms.requestComponent");

  return <IssueForm buildIssueUrl={buildIssueUrl} fields={FIELDS} t={t} />;
}
