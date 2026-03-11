import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./checkbox";

const meta = {
  component: Checkbox,
  title: "Components/Checkbox",
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
