// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "../label/label";
import { Textarea } from "./textarea";

const meta = {
  component: Textarea,
  title: "Core/Textarea",
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="textarea-message">Message</Label>
      <Textarea id="textarea-message" placeholder="Type your message" {...args} />
    </div>
  ),
};
