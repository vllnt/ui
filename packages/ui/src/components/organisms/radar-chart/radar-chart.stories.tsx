import type { Meta, StoryObj } from "@storybook/react-vite";

import { RadarChart } from "./radar-chart";

const meta = {
  args: {
    className: "text-primary",
    data: [
      { label: "Speed", value: 80 },
      { label: "Power", value: 60 },
      { label: "Range", value: 90 },
      { label: "Agility", value: 70 },
      { label: "Defense", value: 50 },
      { label: "Stamina", value: 65 },
    ],
    max: 100,
    size: 260,
  },
  component: RadarChart,
  title: "Data/RadarChart",
} satisfies Meta<typeof RadarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Triangle: Story = {
  args: {
    data: [
      { label: "Cost", value: 30 },
      { label: "Quality", value: 90 },
      { label: "Speed", value: 60 },
    ],
  },
};
