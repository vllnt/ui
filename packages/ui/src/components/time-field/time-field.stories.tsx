import type { Meta, StoryObj } from "@storybook/react-vite";

import { TimeField } from "./time-field";

const meta = {
  args: {
    "aria-label": "Time",
  },
  component: TimeField,
  title: "Form/TimeField",
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-48">
      <TimeField {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: "08:15",
  },
  render: (args) => (
    <div className="w-48">
      <TimeField {...args} />
    </div>
  ),
};
