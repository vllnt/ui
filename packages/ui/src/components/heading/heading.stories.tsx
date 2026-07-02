import type { Meta, StoryObj } from "@storybook/react-vite";

import { Heading } from "./heading";

const meta = {
  args: {
    children: "The quick brown fox",
    level: 1,
  },
  component: Heading,
  title: "Core/Heading",
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Levels: Story = {
  render: () => (
    <div className="space-y-2">
      <Heading level={1}>Heading level 1</Heading>
      <Heading level={2}>Heading level 2</Heading>
      <Heading level={3}>Heading level 3</Heading>
      <Heading level={4}>Heading level 4</Heading>
      <Heading level={5}>Heading level 5</Heading>
      <Heading level={6}>Heading level 6</Heading>
    </div>
  ),
};
