import type { Meta, StoryObj } from "@storybook/react-vite";

import { Dock, DockIcon } from "./dock";

const meta = {
  component: Dock,
  title: "Effects/Dock",
} satisfies Meta<typeof Dock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dock>
      <DockIcon>A</DockIcon>
      <DockIcon>B</DockIcon>
      <DockIcon>C</DockIcon>
      <DockIcon>D</DockIcon>
    </Dock>
  ),
};
