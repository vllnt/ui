import type { Meta, StoryObj } from "@storybook/react-vite";

import { type TreeNode, TreeView } from "./tree-view";

const NODES: TreeNode[] = [
  {
    id: "src",
    label: "src/",
    nodes: [
      {
        id: "components",
        label: "components/",
        nodes: [
          { id: "button", label: "Button.tsx" },
          { id: "card", label: "Card.tsx" },
          { id: "input", label: "Input.tsx" },
        ],
      },
      {
        id: "utils",
        label: "utils/",
        nodes: [
          { id: "cn", label: "cn.ts" },
          { id: "format", label: "format.ts" },
        ],
      },
      { id: "index", label: "index.ts" },
    ],
  },
  { id: "package", label: "package.json" },
  { disabled: true, id: "node_modules", label: "node_modules/" },
];

const meta = {
  args: {
    defaultExpanded: ["src", "components"],
    nodes: NODES,
  },
  component: TreeView,
  title: "Data Display/TreeView",
} satisfies Meta<typeof TreeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultiSelect: Story = {
  args: {
    defaultSelected: ["button", "card"],
    selectionMode: "multiple",
  },
};

export const Collapsed: Story = {
  args: {
    defaultExpanded: [],
    defaultSelected: [],
  },
};

export const SingleLevel: Story = {
  args: {
    nodes: [
      { id: "alpha", label: "Alpha" },
      { id: "beta", label: "Beta" },
      { id: "gamma", label: "Gamma" },
    ],
  },
};
