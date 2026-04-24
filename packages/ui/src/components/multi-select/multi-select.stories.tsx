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
  component: MultiSelect,
  title: "Form/MultiSelect",
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options,
    placeholder: "Select frameworks",
  },
};

export const Searchable: Story = {
  args: {
    options,
    placeholder: "Select frameworks",
    searchable: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState(["react", "vue"]);

    return (
      <div className="w-full max-w-sm">
        <MultiSelect onValueChange={setValue} options={options} searchable value={value} />
      </div>
    );
  },
};
