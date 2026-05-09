import type { Meta, StoryObj } from "@storybook/react-vite";

import { Banner, BannerAction } from "./banner";

const meta = {
  args: {
    children: "Your trial expires in 3 days.",
    dismissible: false,
    variant: "info",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "warning", "success", "destructive"],
    },
  },
  component: Banner,
  title: "Core/Banner",
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Warning: Story = {
  args: {
    children: "Scheduled maintenance tonight at 11pm UTC.",
    variant: "warning",
  },
};

export const Success: Story = {
  args: {
    children: "Your account has been upgraded!",
    variant: "success",
  },
};

export const Destructive: Story = {
  args: {
    children: "Payment failed. Update billing info.",
    variant: "destructive",
  },
};

export const Dismissible: Story = {
  args: {
    children: "You can close this announcement.",
    dismissible: true,
    variant: "info",
  },
};

export const WithAction: Story = {
  args: {
    dismissible: true,
    variant: "warning",
  },
  render: (args) => (
    <Banner {...args}>
      Your trial expires in 3 days.
      <BannerAction>Upgrade now</BannerAction>
    </Banner>
  ),
};
