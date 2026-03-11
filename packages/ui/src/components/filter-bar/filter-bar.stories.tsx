import type { Meta, StoryObj } from "@storybook/react-vite";

import { FilterBar } from "./filter-bar";

const meta = {
  args: {
    currentTags: ["example"],
    difficultyOptions: [{
        label: "Label",
        value: "value",
    tags: ["example"],
  }],
    tags: ["example"],
  },
  component: FilterBar,
  title: "Form/FilterBar",
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
