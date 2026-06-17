import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollProgress } from "./scroll-progress";

const meta = {
  component: ScrollProgress,
  decorators: [
    (Story) => (
      <div className="h-[200vh]">
        <Story />
        <p className="p-12">Scroll the page to grow the bar.</p>
      </div>
    ),
  ],
  title: "Effects/ScrollProgress",
} satisfies Meta<typeof ScrollProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
