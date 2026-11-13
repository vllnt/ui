import type { Meta, StoryObj } from "@storybook/react-vite";

import { PullQuote } from "./pull-quote";

const meta = {
  args: {
    children:
      "A good design system is the one your team forgets they are using.",
    cite: "Ada Lovelace, Notes on the Engine",
    size: "md",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["md", "lg"],
    },
  },
  component: PullQuote,
  title: "Core/PullQuote",
} satisfies Meta<typeof PullQuote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const WithoutCite: Story = {
  args: {
    cite: undefined,
  },
};

export const LargeWithoutCite: Story = {
  args: {
    cite: undefined,
    size: "lg",
  },
};
