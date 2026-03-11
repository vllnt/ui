import type { Meta, StoryObj } from "@storybook/react-vite";

import { FAQ } from "./faq";

const meta = {
  args: {
    children: "Faq",
  },
  component: FAQ,
  title: "Content/Faq",
} satisfies Meta<typeof FAQ>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
