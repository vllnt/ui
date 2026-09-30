import type { Meta, StoryObj } from "@storybook/react-vite";

import { ColorPicker } from "./color-picker";

const meta = {
  component: ColorPicker,
  title: "Form/ColorPicker",
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-56">
      <ColorPicker {...args} />
    </div>
  ),
};

export const CustomDefault: Story = {
  args: {
    defaultValue: "#a855f7",
  },
  render: (args) => (
    <div className="w-56">
      <ColorPicker {...args} />
    </div>
  ),
};
