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

export const MonoFamily: Story = {
  render: () => (
    <div className="space-y-3">
      <Text family="mono" size="lead">
        Mono lead — 18 px JetBrains Mono, line height 1.7.
      </Text>
      <Text family="mono">Mono base — 16 px JetBrains Mono, line height 1.6.</Text>
    </div>
  ),
};

export const Measure: Story = {
  render: () => (
    <div className="space-y-3">
      <Text measure="prose" size="lead">
        Prose measure: a lead paragraph capped at 720 px so a long line stays
        comfortable to read, however wide the page is.
      </Text>
      <Text measure="narrow">
        Narrow measure: body copy capped at 480 px for a tight column.
      </Text>
    </div>
  ),
};

export const DefinitionList: Story = {
  render: () => (
    <dl className="grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-2">
      <Text as="dt" size="small" tone="muted">
        Region
      </Text>
      <Text as="dd" size="small" weight="medium">
        Paris
      </Text>
      <Text as="dt" size="small" tone="muted">
        Plan
      </Text>
      <Text as="dd" size="small" weight="medium">
        Team
      </Text>
    </dl>
  ),
};

export const ListItems: Story = {
  render: () => (
    <ul className="list-disc space-y-1 pl-5">
      <Text as="li">First point</Text>
      <Text as="li">Second point</Text>
    </ul>
  ),
};
