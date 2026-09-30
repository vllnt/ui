import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "./text";

const meta = {
  args: {
    children: "The quick brown fox jumps over the lazy dog.",
  },
  component: Text,
  title: "Core/Text",
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-3">
      <Text size="lead">Lead — larger introductory copy.</Text>
      <Text size="base">Base — standard body copy.</Text>
      <Text size="small">Small — secondary copy.</Text>
      <Text size="caption" tone="muted">
        Caption — muted metadata.
      </Text>
    </div>
  ),
};
