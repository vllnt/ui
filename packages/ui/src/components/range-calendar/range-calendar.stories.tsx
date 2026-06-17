import type { Meta, StoryObj } from "@storybook/react-vite";

import { RangeCalendar } from "./range-calendar";

const meta = {
  component: RangeCalendar,
  title: "Form/RangeCalendar",
} satisfies Meta<typeof RangeCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleMonth: Story = {
  args: {
    numberOfMonths: 1,
  },
};

export const Preselected: Story = {
  args: {
    defaultValue: {
      from: new Date(2026, 5, 10),
      to: new Date(2026, 5, 17),
    },
  },
};
