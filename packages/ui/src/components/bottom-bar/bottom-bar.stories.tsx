import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../button";
import { BottomBar } from "./bottom-bar";

const meta = {
  component: BottomBar,
  render: () => (
    <div className="w-full max-w-3xl rounded-2xl border border-dashed border-border/70 p-4">
      <BottomBar
        center={<div className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">7 awaiting action</div>}
        leading={<div className="text-xs text-muted-foreground">System healthy enough to proceed</div>}
        trailing={<Button size="sm" type="button" variant="ghost">Open inbox</Button>}
      />
    </div>
  ),
  title: "Layout/BottomBar",
} satisfies Meta<typeof BottomBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
