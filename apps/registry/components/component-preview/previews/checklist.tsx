"use client";

import { Checklist } from "@vllnt/ui";

export default function ChecklistPreview() {
  return (
    <Checklist
      items={[
        { id: "step1", label: "Install dependencies" },
        { id: "step2", label: "Configure environment" },
        { id: "step3", label: "Start development server" },
      ]}
      title="Setup Steps"
    />
  );
}
