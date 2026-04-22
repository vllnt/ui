import type { Meta, StoryObj } from "@storybook/react-vite";

import { CountdownTimer } from "./countdown-timer";

const meta = {
  args: {
    deadline: "2026-03-15T10:30:00.000Z",
    description: "Escalation SLA for the current incident channel.",
    now: "2026-03-15T10:00:00.000Z",
    startedAt: "2026-03-15T09:00:00.000Z",
    title: "SLA timer",
  },
  component: CountdownTimer,
  title: "Data/CountdownTimer",
} satisfies Meta<typeof CountdownTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Breached: Story = {
  args: {
    now: "2026-03-15T10:35:00.000Z",
  },
};
