import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorkspaceSwitcher } from "./workspace-switcher";

const meta = {
  args: {
    defaultValue: "orchestrate",
    workspaces: [
      { description: "Runs and outputs", id: "orchestrate", label: "Orchestrate" },
      { description: "Object neighborhoods", id: "objects", label: "Objects" },
      { description: "Telemetry sweep", id: "signals", label: "Signals" },
    ],
  },
  component: WorkspaceSwitcher,
  title: "Navigation/WorkspaceSwitcher",
} satisfies Meta<typeof WorkspaceSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
