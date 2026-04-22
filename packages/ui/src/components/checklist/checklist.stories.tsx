import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checklist } from "./checklist";

const meta = {
  args: {
    items: [{
        id: "1",
        label: "Label",
      }],
  },
  component: Checklist,
  title: "Learning/Checklist",
} satisfies Meta<typeof Checklist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
