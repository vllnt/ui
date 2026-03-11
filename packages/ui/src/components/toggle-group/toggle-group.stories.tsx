import type { Meta, StoryObj } from "@storybook/react-vite";

import { ToggleGroup } from "./toggle-group";

const meta = {
  component: ToggleGroup,
  title: "Components/ToggleGroup",
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
