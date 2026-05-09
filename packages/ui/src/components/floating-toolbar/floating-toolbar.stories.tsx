import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  type FloatingToolbarAction,
  FloatingToolbar,
} from "./floating-toolbar";

const noop = (): void => undefined;

const ACTIONS: FloatingToolbarAction[] = [
  { id: "rename", label: "Rename", onActivate: noop, variant: "primary" },
  { id: "duplicate", label: "Duplicate", onActivate: noop },
  { id: "share", label: "Share", onActivate: noop },
  { id: "delete", label: "Delete", onActivate: noop, variant: "destructive" },
];

const meta = {
  args: {
    actions: ACTIONS,
    x: 120,
    y: 120,
  },
  component: FloatingToolbar,
  decorators: [
    (Story) => (
      <div className="relative h-[180px] w-[480px] rounded-2xl border bg-muted/30">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/FloatingToolbar",
} satisfies Meta<typeof FloatingToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    actions: ACTIONS.map((action) =>
      action.id === "share" ? { ...action, disabled: true } : action,
    ),
  },
};

export const Compact: Story = {
  args: { actions: ACTIONS.slice(0, 2) },
};
