import type { Meta, StoryObj } from "@storybook/react-vite";

import { TimePicker } from "./time-picker";

const meta = {
  args: {
    placeholder: "Select time",
  },
  component: TimePicker,
  title: "Form/TimePicker",
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-48">
      <TimePicker {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: "09:30",
  },
  render: (args) => (
    <div className="w-48">
      <TimePicker {...args} />
    </div>
  ),
};
