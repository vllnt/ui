import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteMain } from "./site-main";

const meta = {
  args: {
    children: "The page goes here. This is the target of the skip link.",
  },
  component: SiteMain,
  title: "Layout/SiteMain",
} satisfies Meta<typeof SiteMain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FlexChild: Story = {
  args: {
    className: "flex-1 p-4",
  },
};
