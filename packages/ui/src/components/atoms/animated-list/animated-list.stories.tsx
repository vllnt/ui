import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedList } from "./animated-list";

const meta = {
  component: AnimatedList,
  title: "Effects/AnimatedList",
} satisfies Meta<typeof AnimatedList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AnimatedList>
      <span>First item</span>
      <span>Second item</span>
      <span>Third item</span>
    </AnimatedList>
  ),
};
