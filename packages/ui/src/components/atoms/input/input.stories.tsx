// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "../label/label";
import { Input } from "./input";

const meta = {
  component: Input,
  title: "Core/Input",
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="input-email">Email</Label>
      <Input id="input-email" placeholder="you@example.com" type="email" {...args} />
    </div>
  ),
};
