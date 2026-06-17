import type { Meta, StoryObj } from "@storybook/react-vite";

import { PhoneInput } from "./phone-input";

const meta = {
  args: {
    placeholder: "555 000 1234",
  },
  component: PhoneInput,
  title: "Form/PhoneInput",
} satisfies Meta<typeof PhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <PhoneInput {...args} />
    </div>
  ),
};

export const DefaultCountry: Story = {
  args: {
    defaultCountry: "GB",
  },
  render: (args) => (
    <div className="w-80">
      <PhoneInput {...args} />
    </div>
  ),
};
