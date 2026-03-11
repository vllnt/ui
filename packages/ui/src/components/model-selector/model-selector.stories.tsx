import type { Meta, StoryObj } from "@storybook/react-vite";

import { ModelSelector } from "./model-selector";

const meta = {
  component: ModelSelector,
  title: "Form/ModelSelector",
} satisfies Meta<typeof ModelSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
