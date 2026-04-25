import type { Meta, StoryObj } from "@storybook/react-vite";

import { DatePicker } from "./date-picker";

const meta = {
  component: DatePicker,
  title: "Form/DatePicker",
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: new Date("2026-04-19T00:00:00.000Z"),
  },
};
