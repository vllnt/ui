import type { Meta, StoryObj } from "@storybook/react-vite";

import { SkipLink } from "./skip-link";

const meta = {
  args: {
    children: "Skip to content",
  },
  component: SkipLink,
  parameters: {
    docs: {
      description: {
        component:
          "Hidden until it has focus. Press Tab once in the canvas to see it.",
      },
    },
  },
  title: "Layout/SkipLink",
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomTarget: Story = {
  args: {
    children: "Skip to the results",
    href: "#results",
  },
};
