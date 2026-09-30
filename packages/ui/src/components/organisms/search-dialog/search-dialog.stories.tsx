import type { Meta, StoryObj } from "@storybook/react-vite";

import { SearchDialog, type SearchItem } from "./search-dialog";

function createItem(
  id: string,
  title: string,
  description: string,
): SearchItem {
  return { description, href: `/components/${id}`, id, title };
}

const items = [
  createItem("button", "Button", "Accessible button primitive."),
  createItem("command", "Command", "Composable command menu."),
];

const meta = {
  args: {
    items: items,
    onSelect: () => {},
  },
  component: SearchDialog,
  title: "Learning/SearchDialog",
} satisfies Meta<typeof SearchDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: items,
    onSelect: () => {},
  },
};

export const WithDocs: Story = {
  args: {
    docsSearch: async () => [
      {
        description: "/docs",
        href: "/docs",
        id: "docs",
        snippet: "Install VLLNT UI and configure dark mode.",
        title: "Documentation",
      },
    ],
    searchPlaceholder: "Search docs and components...",
  },
};
