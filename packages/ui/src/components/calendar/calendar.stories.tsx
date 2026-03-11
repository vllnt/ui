import type { Meta, StoryObj } from "@storybook/react-vite";

import { Calendar } from "./calendar";

const meta = {
  component: Calendar,
  title: "Form/Calendar",
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
