import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  type ViewportBookmark,
  ViewportBookmarks,
} from "./viewport-bookmarks";

const BOOKMARKS: ViewportBookmark[] = [
  { id: "overview", label: "Overview" },
  { id: "release", label: "Release", meta: "Today" },
  { id: "incidents", label: "Incidents", meta: "Live" },
  { id: "audit", label: "Audit" },
];

const meta = {
  args: {
    bookmarks: BOOKMARKS,
  },
  component: ViewportBookmarks,
  title: "Canvas/ViewportBookmarks",
} satisfies Meta<typeof ViewportBookmarks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: { activeId: "release" },
};

export const Empty: Story = {
  args: { bookmarks: [] },
};
