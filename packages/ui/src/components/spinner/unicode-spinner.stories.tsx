import type { Meta, StoryObj } from "@storybook/react-vite";

import { UnicodeSpinner } from "./unicode-spinner";

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
