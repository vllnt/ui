import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorldClockBar } from "./world-clock-bar";

const meta = {
  args: {
    now: "2026-03-15T12:00:00.000Z",
    title: "Follow-the-sun handoff",
    zones: [
      { city: "San Francisco", timeZone: "America/Los_Angeles" },
      { city: "New York", timeZone: "America/New_York" },
      { city: "London", timeZone: "Europe/London" },
      { city: "Singapore", timeZone: "Asia/Singapore" },
    ],
  },
  component: WorldClockBar,
  title: "Data/WorldClockBar",
} satisfies Meta<typeof WorldClockBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TimeOnly: Story = {
  args: {
    showDate: false,
  },
};
