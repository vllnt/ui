import type { Meta, StoryObj } from "@storybook/react-vite";

import { ObjectInspector } from "./object-inspector";

const meta = {
  args: {
    kind: "run",
    status: "running",
    subtitle: "claude-3.7 · 128k ctx",
    title: "research-2025-04-15",
  },
  component: ObjectInspector,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/ObjectInspector",
} satisfies Meta<typeof ObjectInspector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { kind: undefined, title: undefined },
};

export const WithBody: Story = {
  args: {
    children: (
      <p className="rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
        Property sections render here.
      </p>
    ),
  },
};

export const Failed: Story = {
  args: {
    kind: "task",
    status: "failed",
    subtitle: "Schema mismatch",
    title: "ingest-rows",
  },
};
