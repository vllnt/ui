import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  UnicodeSpinner,
  UNICODE_SPINNER_ANIMATIONS,
} from "./unicode-spinner";

const meta = {
  args: {
    animation: "braille",
  },
  component: UnicodeSpinner,
  title: "Utility/UnicodeSpinner",
} satisfies Meta<typeof UnicodeSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Braille: Story = {};

export const Scanline: Story = {
  args: {
    animation: "scanline",
    label: "Syncing feed",
  },
};

export const Helix: Story = {
  args: {
    animation: "helix",
    label: "Booting core",
  },
};

export const Cascade: Story = {
  args: {
    animation: "cascade",
    label: "Loading assets",
  },
};

export const AllAnimations: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {UNICODE_SPINNER_ANIMATIONS.map((animation) => (
        <div
          className="flex items-center justify-between rounded-md border border-border bg-background p-3"
          key={animation}
        >
          <span className="text-sm font-medium capitalize text-foreground">
            {animation}
          </span>
          <UnicodeSpinner animation={animation} paused />
        </div>
      ))}
    </div>
  ),
};
