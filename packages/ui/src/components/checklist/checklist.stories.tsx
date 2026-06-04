import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checklist } from "./checklist";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    items: [{
        id: "1",
        label: "Label",
      }],
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: Checklist,
  title: "Learning/Checklist",
} satisfies Meta<typeof Checklist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
