import type { Meta, StoryObj } from "@storybook/react-vite";

import { Grid } from "./grid";

const meta = {
  args: {
    cols: 2,
    gap: 4,
  },
  component: Grid,
  title: "Core/Grid",
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

function Cell({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-border bg-muted p-4 text-center text-sm">
      {label}
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <Grid {...args}>
      <Cell label="1" />
      <Cell label="2" />
      <Cell label="3" />
      <Cell label="4" />
    </Grid>
  ),
};

export const Responsive: Story = {
  args: {
    cols: 1,
    gap: 6,
    lgCols: 4,
    mdCols: 2,
  },
  render: (args) => (
    <Grid {...args}>
      <Cell label="One" />
      <Cell label="Two" />
      <Cell label="Three" />
      <Cell label="Four" />
    </Grid>
  ),
};
