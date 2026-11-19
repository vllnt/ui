import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  args: {
    children: "Alert",
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
    },
  },
  component: Alert,
  title: "Data/Alert",
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Title and body stay in the foreground; only the icon and the border carry the status colour. */
export const VariantDestructive: Story = {
  args: { variant: "destructive" },
  render: (args) => (
    <Alert {...args}>
      <AlertCircle aria-hidden="true" className="size-4" />
      <AlertTitle>Payment failed</AlertTitle>
      <AlertDescription>Check the card number and try again.</AlertDescription>
    </Alert>
  ),
};
