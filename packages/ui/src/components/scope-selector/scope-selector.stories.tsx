import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  type ScopeSelectorSelection,
  ScopeSelector,
} from "./scope-selector";

function ScopeSelectorStory(args: React.ComponentProps<typeof ScopeSelector>) {
  const [selection, setSelection] = useState<ScopeSelectorSelection | undefined>();

  return (
    <div className="w-full max-w-sm space-y-3">
      <ScopeSelector
        {...args}
        onValueChange={(nextSelection) => {
          setSelection(nextSelection);
          args.onValueChange?.(nextSelection);
        }}
      />
      <p className="text-sm text-muted-foreground">
        Selected: {selection?.path.map((node) => node.label).join(" / ") ?? "None"}
      </p>
    </div>
  );
}

const meta = {
  args: {
    nodes: [
      {
        children: [
          {
            badge: "3 envs",
            children: [
              { id: "prod-us", label: "US East" },
              { id: "prod-eu", label: "EU West" },
              { id: "prod-apac", label: "APAC" },
            ],
            description: "Customer-facing production traffic.",
            id: "production",
            label: "Production",
          },
          {
            children: [{ id: "staging-us", label: "US East" }],
            description: "Pre-release validation and QA.",
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
    ],
  },
  component: ScopeSelector,
  render: ScopeSelectorStory,
  title: "Analytics/ScopeSelector",
} satisfies Meta<typeof ScopeSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultSelection: Story = {
  args: {
    defaultValue: "prod-eu",
  },
};
