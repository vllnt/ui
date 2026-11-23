// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp";

const meta = {
  args: {
    "aria-label": "One-time code",
    children: (
      <>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </>
    ),
    maxLength: 6,
  },
  component: InputOTP,
  parameters: {
    a11y: {
      focus: {
        reason:
          "The native input is transparent; the active slot draws the focus ring (ring-2 ring-ring), which the runner's element/parent check cannot see.",
      },
    },
  },
  title: "Form/InputOtp",
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
