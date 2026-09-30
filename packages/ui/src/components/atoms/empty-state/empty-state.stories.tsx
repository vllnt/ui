import type { Meta, StoryObj } from "@storybook/react-vite";

import { EmptyState } from "./empty-state";

const meta = {
  args: {
    description: "Try adjusting your search or filters.",
    size: "md",
    title: "No results found",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  component: EmptyState,
  title: "Core/EmptyState",
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SizeSm: Story = {
  args: {
    description: "Inline placeholder.",
    size: "sm",
    title: "Empty",
  },
};

export const SizeLg: Story = {
  args: {
    description:
      "There is nothing here yet. Get started by creating your first item.",
    size: "lg",
    title: "Welcome",
  },
};

export const WithAction: Story = {
  render: (args) => (
    <EmptyState {...args}>
      <button
        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
        type="button"
      >
        Clear filters
      </button>
    </EmptyState>
  ),
};
