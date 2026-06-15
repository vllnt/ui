"use client";

import { ScopeSelector } from "@vllnt/ui";

export default function ScopeSelectorPreview() {
  return (
    <div className="w-full max-w-sm">
      <ScopeSelector
        nodes={[
          {
            children: [
              {
                children: [
                  { id: "prod-us", label: "US East" },
                  { id: "prod-eu", label: "EU West" },
                ],
                id: "production",
                label: "Production",
              },
              {
                children: [{ id: "staging-us", label: "US East" }],
                id: "staging",
                label: "Staging",
              },
            ],
            id: "environments",
            label: "Environments",
          },
          {
            children: [
              { id: "team-growth", label: "Growth" },
              { id: "team-data", label: "Data" },
            ],
            id: "teams",
            label: "Teams",
          },
        ]}
      />
    </div>
  );
}
