import type { Meta, StoryObj } from "@storybook/react-vite";

import { Display } from "./display";

const meta = {
  args: {
    children: "Ship faster",
  },
  component: Display,
  title: "Core/Display",
} satisfies Meta<typeof Display>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AsHeroHeading: Story = {
  args: {
    as: "h1",
    children: "Build the web, faster",
  },
};

export const Animated: Story = {
  args: {
    animated: true,
    children: "Reveal on mount",
  },
};
