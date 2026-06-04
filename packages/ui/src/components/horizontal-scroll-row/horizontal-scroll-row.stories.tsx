import type { Meta, StoryObj } from "@storybook/react-vite";

import { HorizontalScrollRow } from "./horizontal-scroll-row";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: HorizontalScrollRow,
  title: "Navigation/HorizontalScrollRow",
} satisfies Meta<typeof HorizontalScrollRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
