import type { Meta, StoryObj } from "@storybook/react-vite";

import { TopBar } from "./top-bar";
import { WorkspaceSwitcher } from "../workspace-switcher";

const meta = {
  component: TopBar,
  render: () => (
    <TopBar
      subtitle="Calm spatial control plane"
      title="Operator workspace"
      trailing={<button className="rounded-full border px-3 py-1.5 text-sm" type="button">Open command</button>}
    >
      <WorkspaceSwitcher
        defaultValue="orchestrate"
        workspaces={[
          { id: "orchestrate", label: "Orchestrate" },
          { id: "objects", label: "Objects" },
          { id: "signals", label: "Signals" },
        ]}
      />
    </TopBar>
  ),
  title: "Layout/TopBar",
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
