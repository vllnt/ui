import type { Meta, StoryObj } from "@storybook/react-vite";

import { SearchBar } from "./search-bar";

const meta = {
  component: SearchBar,
  title: "Components/SearchBar",
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
