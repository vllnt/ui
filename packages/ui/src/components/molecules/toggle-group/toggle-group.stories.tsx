import type { Meta, StoryObj } from "@storybook/react-vite";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta = {
  args: {
    type: "single",
  },
  component: ToggleGroup,
  title: "Core/ToggleGroup",
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold">B</ToggleGroupItem>
      <ToggleGroupItem value="italic">I</ToggleGroupItem>
      <ToggleGroupItem value="underline">U</ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** The group and its items add no classes; each draws only its `className`. */
export const Unstyled: Story = {
  args: { className: "flex gap-2", variant: "unstyled" },
  render: (args) => (
    <ToggleGroup {...args}>
      {["Easy", "Medium", "Hard"].map((label) => (
        <ToggleGroupItem
          className="rounded-sm border border-border px-3 py-1 text-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          key={label}
          value={label.toLowerCase()}
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  ),
};

