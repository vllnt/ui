import type { Meta, StoryObj } from "@storybook/react-vite";

import { Comparison } from "./comparison";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    after: {
      items: ["example"],
      title: "Example Title",
    before: {
      items: ["example"],
      title: "Example Title",
    },
  },
    before: {
      items: ["example"],
      title: "Example Title",
    },
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: Comparison,
  title: "Data/Comparison",
} satisfies Meta<typeof Comparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
