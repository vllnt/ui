import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../button/button";
import { Toolbar, ToolbarSeparator } from "./toolbar";

const meta = {
  args: {
    "aria-label": "Text formatting",
    orientation: "horizontal",
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
  component: Toolbar,
  title: "Core/Toolbar",
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <Button size="sm" variant="ghost">
        Bold
      </Button>
      <Button size="sm" variant="ghost">
        Italic
      </Button>
      <ToolbarSeparator />
      <Button size="sm" variant="ghost">
        Link
      </Button>
      <Button size="sm" variant="ghost">
        Code
      </Button>
    </Toolbar>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <Toolbar {...args}>
      <Button size="sm" variant="ghost">
        Top
      </Button>
      <ToolbarSeparator orientation="horizontal" />
      <Button size="sm" variant="ghost">
        Bottom
      </Button>
    </Toolbar>
  ),
};
