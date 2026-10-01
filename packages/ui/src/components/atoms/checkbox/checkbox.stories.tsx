// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "../label/label";
import { Checkbox } from "./checkbox";

const meta = {
  component: Checkbox,
  title: "Core/Checkbox",
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-terms" {...args} />
      <Label htmlFor="checkbox-terms">Accept terms and conditions</Label>
    </div>
  ),
};
