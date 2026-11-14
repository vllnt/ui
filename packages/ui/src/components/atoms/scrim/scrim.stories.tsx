import type { Meta, StoryObj } from "@storybook/react-vite";

import { Scrim } from "./scrim";

const meta = {
  argTypes: {
    level: {
      control: "select",
      options: ["dim", "strong"],
    },
  },
  component: Scrim,
  decorators: [
    (Story) => (
      <div className="relative h-64 w-96 overflow-hidden rounded-xl border bg-card p-4 text-sm">
        <p>
          Content sits beneath the scrim. The overlay is flat black in every
          theme mode, so the surface behind it stays readable at dim and hides
          at strong.
        </p>
        <Story />
      </div>
    ),
  ],
  title: "Effects/Scrim",
} satisfies Meta<typeof Scrim>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dim: Story = { args: { level: "dim" } };

export const Strong: Story = { args: { level: "strong" } };
