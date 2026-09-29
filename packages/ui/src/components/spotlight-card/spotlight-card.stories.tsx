import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../.storybook/decorators";

import { SpotlightCard } from "./spotlight-card";

const meta = {
  args: {
    children: "Move your pointer across me",
  },
  component: SpotlightCard,
  decorators: [withWrapper("w-80 p-12")],
  title: "Effects/SpotlightCard",
} satisfies Meta<typeof SpotlightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
