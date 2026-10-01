import type { Meta, StoryObj } from "@storybook/react-vite";

import { DateField } from "./date-field";

const meta = {
  args: {
    "aria-label": "Date",
  },
  component: DateField,
  title: "Form/DateField",
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-52">
      <DateField {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: "2026-06-17",
  },
  render: (args) => (
    <div className="w-52">
      <DateField {...args} />
    </div>
  ),
};
