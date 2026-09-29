import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../.storybook/decorators";

import { PresenceSyncIndicator } from "./presence-sync-indicator";

const meta = {
  args: {
    state: "live",
    status: "3 peers",
  },
  component: PresenceSyncIndicator,
  decorators: [withWrapper("flex items-start bg-muted/30 p-4")],
  title: "Canvas/PresenceSyncIndicator",
} satisfies Meta<typeof PresenceSyncIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = {};

export const Syncing: Story = { args: { state: "syncing", status: "2 changes" } };
export const Reconnecting: Story = { args: { state: "reconnecting", status: "retry 2 / 5" } };
export const Offline: Story = { args: { state: "offline", status: undefined } };
