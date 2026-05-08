import type { Meta, StoryObj } from "@storybook/react-vite";

import { ViewportBookmarks } from "./viewport-bookmarks";

const noop = (): void => undefined;

const meta = {
  args: {
    activeId: "incidents",
    bookmarks: [
      { color: "#5b8def", id: "home", label: "Home base" },
      { color: "#10b981", detail: "1.4× zoom", id: "drilldown", label: "Drill-down" },
      { color: "#ef4444", detail: "5 open", id: "incidents", label: "Incidents" },
      { color: "#f59e0b", id: "watchtower", label: "Watch tower" },
    ],
    onSelect: noop,
  },
  component: ViewportBookmarks,
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/ViewportBookmarks",
} satisfies Meta<typeof ViewportBookmarks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { bookmarks: [] },
};

export const NoActive: Story = {
  args: { activeId: undefined },
};

export const ReadOnly: Story = {
  args: { onSelect: undefined },
};
