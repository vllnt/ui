import type { Meta, StoryObj } from "@storybook/react-vite";

import { InputOTP } from "./input-otp";

const meta = {
  component: InputOTP,
  title: "Form/InputOtp",
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
