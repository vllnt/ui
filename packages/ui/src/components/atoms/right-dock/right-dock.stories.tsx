import type { Meta, StoryObj } from "@storybook/react-vite";

import { RightDock } from "./right-dock";

const meta = {
  component: RightDock,
  render: () => (
    <div className="h-[420px] w-[320px]">
      <RightDock
        footer={<div className="text-xs text-muted-foreground">Context stays secondary to the viewport.</div>}
        header={<div className="text-xs text-muted-foreground">Contextual panels and detail inspectors.</div>}
        title="Context Dock"
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">Selected object summary</div>
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">Recent run activity</div>
        </div>
      </RightDock>
    </div>
  ),
  title: "Layout/RightDock",
} satisfies Meta<typeof RightDock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
