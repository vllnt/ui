import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { SegmentedControl, SegmentedControlItem } from "./segmented-control";

const meta = {
  argTypes: {
    fit: { control: "boolean" },
    variant: {
      control: "select",
      options: ["filled", "hairline"],
    },
  },
  component: SegmentedControl,
  title: "Form/SegmentedControl",
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <SegmentedControl aria-label="Project view" defaultValue="board">
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="timeline">Timeline</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <SegmentedControl aria-label="Billing cadence" defaultValue="monthly" disabled>
        <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

function ControlledSegmentedControlDemo() {
  const [value, setValue] = React.useState("activity");

  return (
    <div className="w-full max-w-sm space-y-3">
      <SegmentedControl aria-label="Dashboard section" onValueChange={setValue} value={value}>
        <SegmentedControlItem value="activity">Activity</SegmentedControlItem>
        <SegmentedControlItem value="usage">Usage</SegmentedControlItem>
        <SegmentedControlItem value="members">Members</SegmentedControlItem>
      </SegmentedControl>
      <p className="text-sm text-muted-foreground">Selected: {value}</p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledSegmentedControlDemo />,
};

export const Fit: Story = {
  render: () => (
    <SegmentedControl aria-label="Layout" defaultValue="grid" fit>
      <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      <SegmentedControlItem value="list">List</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const Hairline: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <SegmentedControl aria-label="Theme" defaultValue="light" variant="hairline">
        <SegmentedControlItem value="light">Light</SegmentedControlItem>
        <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
        <SegmentedControlItem value="system">System</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

export const FitHairlineOnGlass: Story = {
  render: () => (
    <div className="vllnt-glass vllnt-glass-dense inline-flex rounded-xl border p-3">
      <SegmentedControl aria-label="Theme" defaultValue="light" fit variant="hairline">
        <SegmentedControlItem value="light">Light</SegmentedControlItem>
        <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};
