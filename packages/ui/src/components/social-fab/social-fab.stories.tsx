import type { Meta, StoryObj } from "@storybook/react-vite";

import { SocialFAB } from "./social-fab";

const meta = {
  args: {
    actions: [
      { id: "1", label: "Copy Link", onClick: () => {} },
      { id: "2", label: "Bookmark", onClick: () => {} },
    ],
    labels: {
      close: "Close",
      share: "Share",
    },
  },
  component: SocialFAB,
  title: "Utility/SocialFab",
} satisfies Meta<typeof SocialFAB>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
