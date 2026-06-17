import type { Meta, StoryObj } from "@storybook/react-vite";

import { SankeyChart } from "./sankey-chart";

const meta = {
  args: {
    className: "text-primary",
    height: 300,
    links: [
      { source: "visits", target: "signup", value: 60 },
      { source: "visits", target: "bounce", value: 40 },
      { source: "signup", target: "trial", value: 35 },
      { source: "signup", target: "churn", value: 25 },
      { source: "trial", target: "paid", value: 20 },
      { source: "trial", target: "churn", value: 15 },
    ],
    nodes: [
      { id: "visits", label: "Visits" },
      { id: "signup", label: "Signup" },
      { id: "bounce", label: "Bounce" },
      { id: "trial", label: "Trial" },
      { id: "churn", label: "Churn" },
      { id: "paid", label: "Paid" },
    ],
    width: 520,
  },
  component: SankeyChart,
  title: "Data/SankeyChart",
} satisfies Meta<typeof SankeyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
