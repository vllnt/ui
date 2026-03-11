// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "./toast";

const meta = {
  args: {
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
    },
  },
  component: Toast,
  parameters: {
    layout: "centered",
  },
  title: "Components/Toast",
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (arguments_) => (
    <Toast {...arguments_}>
      <div className="grid gap-1">
        <ToastTitle>Notification</ToastTitle>
        <ToastDescription>Your changes have been saved.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: (arguments_) => (
    <Toast {...arguments_}>
      <div className="grid gap-1">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>
          Something went wrong. Please try again.
        </ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
};

export const WithAction: Story = {
  render: (arguments_) => (
    <Toast {...arguments_}>
      <div className="grid gap-1">
        <ToastTitle>Update available</ToastTitle>
        <ToastDescription>A new version is ready to install.</ToastDescription>
      </div>
      <ToastAction altText="Update now">Update</ToastAction>
    </Toast>
  ),
};
