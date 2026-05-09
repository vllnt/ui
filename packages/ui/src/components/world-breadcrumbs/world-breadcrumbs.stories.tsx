import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorldBreadcrumbs } from "./world-breadcrumbs";

const noop = (): void => undefined;

const meta = {
  args: {
    crumbs: [
      { id: "world", kind: "world", label: "Production" },
      { id: "group", kind: "group", label: "Ingest cluster" },
      { id: "run", kind: "run", label: "research-2025" },
      { id: "task", kind: "task", label: "score" },
    ],
    onSelect: noop,
  },
  component: WorldBreadcrumbs,
  decorators: [
    (Story) => (
      <div className="bg-muted/30 p-4">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/WorldBreadcrumbs",
} satisfies Meta<typeof WorldBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Shallow: Story = {
  args: {
    crumbs: [
      { id: "world", kind: "world", label: "Production" },
      { id: "run", kind: "run", label: "research-2025" },
    ],
  },
};

export const Empty: Story = {
  args: { crumbs: [] },
};

export const ReadOnly: Story = {
  args: { onSelect: undefined },
};
