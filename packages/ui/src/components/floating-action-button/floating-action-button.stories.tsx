import type { Meta, StoryObj } from "@storybook/react-vite";

import { FloatingActionButton } from "./floating-action-button";

const meta = {
  args: {
    onClick: () => {},
  },
  component: FloatingActionButton,
  title: "Utility/FloatingActionButton",
} satisfies Meta<typeof FloatingActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
