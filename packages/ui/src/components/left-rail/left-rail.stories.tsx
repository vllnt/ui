import type { Meta, StoryObj } from "@storybook/react-vite";

import { Compass, Layers3, Sparkles } from "lucide-react";

import { Button } from "../button";
import { LeftRail } from "./left-rail";

const meta = {
  component: LeftRail,
  render: () => (
    <div className="h-[420px]">
      <LeftRail
        footer={<Button aria-label="Create" size="icon" type="button" variant="secondary"><Sparkles className="size-4" /></Button>}
        title="Mode"
      >
        <Button aria-label="Canvas" size="icon" type="button" variant="secondary"><Compass className="size-4" /></Button>
        <Button aria-label="Objects" size="icon" type="button" variant="ghost"><Layers3 className="size-4" /></Button>
      </LeftRail>
    </div>
  ),
  title: "Layout/LeftRail",
} satisfies Meta<typeof LeftRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
