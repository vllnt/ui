import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../.storybook/decorators";

import { AlertPulse } from "./alert-pulse";

const meta = {
  args: {
    cx: 120,
    cy: 100,
    radius: 36,
    severity: "warn",
  },
  component: AlertPulse,
  decorators: [withWrapper("relative bg-muted/30", { height: 220, width: 240 })],
  title: "Canvas/AlertPulse",
} satisfies Meta<typeof AlertPulse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Info: Story = { args: { severity: "info" } };
export const Error: Story = { args: { severity: "error", radius: 48 } };
export const ReducedMotion: Story = { args: { reducedMotion: true } };
