import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusBoard } from "./status-board";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    description: "Track health, latency, and incident context across key services.",
    items: [
      {
        description: "Traffic and auth requests are stable.",
        label: "Gateway",
        meta: "Updated 1m ago",
        status: "healthy",
        value: "99.98%",
      },
      {
        description: "Queue depth is trending upward.",
        label: "Worker pool",
        meta: "4 delayed jobs",
        status: "warning",
        value: "82%",
      },
      {
        description: "Fallback region currently disabled.",
        label: "Edge POP",
        meta: "Planned maintenance",
        status: "maintenance",
        value: "2/3 online",
      },
      {
        description: "Database replica lag exceeded threshold.",
        label: "Analytics replica",
        meta: "Page opened 4m ago",
        status: "critical",
        value: "420ms lag",
      },
    ],
    title: "Service health",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: StatusBoard,
  title: "Data/StatusBoard",
} satisfies Meta<typeof StatusBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    columns: 2,
  },
};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
