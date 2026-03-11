import type { Meta, StoryObj } from "@storybook/react-vite";

import { ViewSwitcher } from "./view-switcher";

const meta = {
  args: {
    defaultKey: "list",
    options: [
      { key: "list", label: "List View" },
      { key: "grid", label: "Grid View" },
      { key: "table", label: "Table View" },
    ],
  },
  component: ViewSwitcher,
  title: "Components/ViewSwitcher",
} satisfies Meta<typeof ViewSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
