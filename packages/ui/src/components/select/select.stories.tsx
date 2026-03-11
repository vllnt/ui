import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "./select";

const meta = {
  component: Select,
  title: "Components/Select",
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
