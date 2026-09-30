import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../.storybook/decorators";

import { FollowMode } from "./follow-mode";

const noop = (): void => undefined;

const meta = {
  args: {
    children: (
      <div className="flex h-full w-full items-center justify-center bg-muted/20 text-sm text-muted-foreground">
        Followed canvas content
      </div>
    ),
    color: "blue",
    name: "Sam",
    onStop: noop,
  },
  component: FollowMode,
  decorators: [withWrapper(undefined, { height: 280, width: 480 })],
  title: "Canvas/FollowMode",
} satisfies Meta<typeof FollowMode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Emerald: Story = { args: { color: "emerald", name: "Wei" } };
export const NoStop: Story = { args: { onStop: undefined } };
