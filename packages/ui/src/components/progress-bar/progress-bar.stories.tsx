import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressBar } from "./progress-bar";

const meta = {
  component: ProgressBar,
  title: "Components/ProgressBar",
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
