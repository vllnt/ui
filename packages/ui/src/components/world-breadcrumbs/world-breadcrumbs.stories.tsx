import type { Meta, StoryObj } from "@storybook/react-vite";

import { type WorldCrumb, WorldBreadcrumbs } from "./world-breadcrumbs";

const CRUMBS: WorldCrumb[] = [
  { id: "ws", label: "Acme" },
  { id: "proj", label: "Q4 launch" },
  { id: "board", label: "Operations" },
  { id: "view", label: "Release timeline" },
];

const meta = {
  args: { crumbs: CRUMBS },
  component: WorldBreadcrumbs,
  title: "Canvas/WorldBreadcrumbs",
} satisfies Meta<typeof WorldBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMeta: Story = {
  args: {
    crumbs: [
      { id: "ws", label: "Acme" },
      { id: "proj", label: "Q4 launch", meta: "v2" },
      { id: "view", label: "Release timeline", meta: "draft" },
    ],
  },
};

export const Chevron: Story = {
  args: { separator: "›" },
};

export const Anchors: Story = {
  args: {
    crumbs: [
      { href: "/acme", id: "ws", label: "Acme" },
      { href: "/acme/q4", id: "proj", label: "Q4 launch" },
      { id: "view", label: "Release timeline" },
    ],
  },
};

export const Shallow: Story = {
  args: {
    crumbs: [
      { id: "ws", label: "Acme" },
      { id: "view", label: "Overview" },
    ],
  },
};
