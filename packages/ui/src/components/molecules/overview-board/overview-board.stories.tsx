import type { Meta, StoryObj } from "@storybook/react-vite";

import { OverviewBoard } from "./overview-board";

const meta = {
  component: OverviewBoard,
  args: {
    eyebrow: "Operator overview",
    heading: "Morning priorities",
    items: [
      {
        description: "Retries that still need intervention after the overnight automation sweep.",
        heading: "Errors",
        id: "errors",
        metric: "3",
        tone: "danger",
      },
      {
        ctaLabel: "Open queue",
        description: "Actionable approvals and follow-ups that should land before lunch.",
        heading: "Actions",
        id: "actions",
        metric: "7",
        tone: "warning",
      },
      {
        description: "Background automations that already recovered and only need a quick skim.",
        heading: "Runs",
        id: "runs",
        metric: "14",
      },
    ],
    subtitle: "A compact summary board for the floating canvas shell right rail or overview route.",
  },
  render: (args) => <OverviewBoard {...args} />,
  title: "Layout/OverviewBoard",
} satisfies Meta<typeof OverviewBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
