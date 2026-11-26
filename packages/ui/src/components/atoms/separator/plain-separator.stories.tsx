import type { Meta, StoryObj } from "@storybook/react-vite";

import { PlainSeparator } from "./plain-separator";

const meta = {
  argTypes: {
    decorative: { control: "boolean" },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    variant: {
      control: "select",
      options: ["solid", "dashed"],
    },
  },
  component: PlainSeparator,
  title: "Core/PlainSeparator",
} satisfies Meta<typeof PlainSeparator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dashed: Story = { args: { variant: "dashed" } };

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-8 items-center gap-3">
      <span>One</span>
      <PlainSeparator {...args} />
      <span>Two</span>
    </div>
  ),
};
