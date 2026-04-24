import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { MultiSelect } from "./multi-select";

const options = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Svelte", value: "svelte" },
  { label: "Solid", value: "solid" },
];

const meta = {
  args: {
    options: options,
    placeholder: "Select frameworks",
  },
  component: MultiSelect,
  title: "Form/MultiSelect",
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Searchable: Story = {
  args: {
    searchable: true,
  },
};

export const Controlled: Story = {
  args: {
    searchable: true,
  },
  render: (args) => {
    const [value, setValue] = React.useState(["react", "vue"]);

    return (
      <div className="w-full max-w-sm">
        <MultiSelect {...args} onValueChange={setValue} value={value} />
      </div>
    );
  },
};
