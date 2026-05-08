import type { Meta, StoryObj } from "@storybook/react-vite";

import { PresenceSyncIndicator } from "./presence-sync-indicator";

const meta = {
  args: { status: "connected" },
  component: PresenceSyncIndicator,
  title: "Canvas/PresenceSyncIndicator",
} satisfies Meta<typeof PresenceSyncIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = { args: { detail: "42 ms" } };

export const Syncing: Story = {
  args: { detail: "Saving…", status: "syncing" },
};

export const Reconnecting: Story = {
  args: { detail: "Retrying", status: "reconnecting" },
};

export const Offline: Story = { args: { status: "offline" } };

export const IconOnly: Story = { args: { iconOnly: true, status: "connected" } };
