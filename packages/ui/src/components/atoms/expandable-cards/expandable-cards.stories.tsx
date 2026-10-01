import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExpandableCards } from "./expandable-cards";

const meta = {
  args: {
    cards: [
      {
        content: "Detailed body revealed on expand.",
        description: "Click to expand",
        id: "one",
        title: "Getting started",
      },
      {
        content: "Another panel of content.",
        id: "two",
        title: "Advanced usage",
      },
    ],
  },
  component: ExpandableCards,
  title: "Effects/ExpandableCards",
} satisfies Meta<typeof ExpandableCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
