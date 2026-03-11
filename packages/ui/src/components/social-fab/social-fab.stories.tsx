import type { Meta, StoryObj } from "@storybook/react-vite";

import { SocialFAB } from "./social-fab";

const meta = {
  component: SocialFAB,
  title: "Components/SocialFab",
} satisfies Meta<typeof SocialFAB>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
