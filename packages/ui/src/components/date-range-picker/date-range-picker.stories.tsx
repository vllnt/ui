import type { Meta, StoryObj } from "@storybook/react-vite";

import { DateRangePicker } from "./date-range-picker";

const meta = {
  args: {
    placeholder: "Pick a date range",
  },
  component: DateRangePicker,
  title: "Form/DateRangePicker",
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <DateRangePicker {...args} />
    </div>
  ),
};

export const Preselected: Story = {
  args: {
    defaultValue: {
      from: new Date(2026, 5, 10),
      to: new Date(2026, 5, 17),
    },
  },
  render: (args) => (
    <div className="w-72">
      <DateRangePicker {...args} />
    </div>
  ),
};
