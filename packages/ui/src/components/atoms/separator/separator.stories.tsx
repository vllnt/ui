import type { Meta, StoryObj } from "@storybook/react-vite";

import { Separator } from "./separator";

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
  component: Separator,
  title: "Core/Separator",
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dashed: Story = { args: { variant: "dashed" } };

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-8 items-center gap-3 text-sm">
      Left
      <Separator {...args} />
      Right
    </div>
  ),
};

export const DashedVertical: Story = {
  args: { orientation: "vertical", variant: "dashed" },
  render: (args) => (
    <div className="flex h-8 items-center gap-3 text-sm">
      Left
      <Separator {...args} />
      Right
    </div>
  ),
};

export const Semantic: Story = { args: { decorative: false } };
