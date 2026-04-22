import type { Meta, StoryObj } from "@storybook/react-vite";

import { SeverityBadge } from "./severity-badge";

const meta = {
  args: {
    level: "critical",
  },
  component: SeverityBadge,
  title: "Data/SeverityBadge",
} satisfies Meta<typeof SeverityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Levels: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <SeverityBadge level="critical" />
      <SeverityBadge level="high" />
      <SeverityBadge level="medium" />
      <SeverityBadge level="low" />
      <SeverityBadge level="info" />
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <SeverityBadge level="critical" tone="solid" />
      <SeverityBadge level="critical" tone="soft" />
      <SeverityBadge level="critical" tone="outline" />
    </div>
  ),
};

export const Pulsing: Story = {
  args: {
    level: "critical",
    pulse: true,
    tone: "solid",
  },
};

export const CustomLabel: Story = {
  args: {
    children: "P1 incident",
    level: "critical",
    tone: "solid",
  },
};
