import type { Meta, StoryObj } from "@storybook/react-vite";

import { SpotlightCard } from "./spotlight-card";

const meta = {
  args: {
    children: "Move your pointer across me",
  },
  component: SpotlightCard,
  decorators: [
    (Story) => (
      <div className="w-80 p-12">
        <Story />
      </div>
    ),
  ],
  title: "Effects/SpotlightCard",
} satisfies Meta<typeof SpotlightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
