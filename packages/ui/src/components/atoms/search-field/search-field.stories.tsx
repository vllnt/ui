import type { Meta, StoryObj } from "@storybook/react-vite";

import { SearchField } from "./search-field";

const meta = {
  args: {
    placeholder: "Search...",
  },
  component: SearchField,
  title: "Form/SearchField",
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <SearchField {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: "design tokens",
  },
  render: (args) => (
    <div className="w-72">
      <SearchField {...args} />
    </div>
  ),
};
