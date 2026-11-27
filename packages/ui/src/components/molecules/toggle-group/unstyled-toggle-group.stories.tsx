import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  UnstyledToggleGroup,
  UnstyledToggleGroupItem,
} from "./unstyled-toggle-group";

const itemClasses =
  "rounded-sm px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[disabled]:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground";

const meta = {
  args: {
    "aria-label": "View",
    className: "inline-flex gap-1 rounded-md border border-border p-1",
    type: "single",
  },
  component: UnstyledToggleGroup,
  title: "Core/UnstyledToggleGroup",
} satisfies Meta<typeof UnstyledToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <UnstyledToggleGroup {...args}>
      <UnstyledToggleGroupItem className={itemClasses} value="grid">
        Grid
      </UnstyledToggleGroupItem>
      <UnstyledToggleGroupItem className={itemClasses} value="list">
        List
      </UnstyledToggleGroupItem>
      <UnstyledToggleGroupItem className={itemClasses} disabled value="map">
        Map
      </UnstyledToggleGroupItem>
    </UnstyledToggleGroup>
  ),
};

export const Multiple: Story = {
  args: { "aria-label": "Format", type: "multiple" },
  render: (args) => (
    <UnstyledToggleGroup {...args}>
      <UnstyledToggleGroupItem className={itemClasses} value="bold">
        B
      </UnstyledToggleGroupItem>
      <UnstyledToggleGroupItem className={itemClasses} value="italic">
        I
      </UnstyledToggleGroupItem>
    </UnstyledToggleGroup>
  ),
};
