import type { Meta, StoryObj } from "@storybook/react-vite";

import { QrCode } from "./qr-code";

const meta = {
  args: {
    level: "M",
    size: 160,
    value: "https://vllnt.com",
  },
  argTypes: {
    level: {
      control: "inline-radio",
      options: ["L", "M", "Q", "H"],
    },
  },
  component: QrCode,
  title: "Core/QrCode",
} satisfies Meta<typeof QrCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HighErrorCorrection: Story = {
  args: {
    level: "H",
    size: 200,
    value: "WIFI:S:guest-network;T:WPA;P:welcome123;;",
  },
};

export const Small: Story = {
  args: {
    size: 96,
    value: "vllnt",
  },
};
