import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { TagsInput } from "./tags-input";

const meta = {
  component: TagsInput,
  title: "Form/TagsInput",
} satisfies Meta<typeof TagsInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Framework tags",
    defaultValue: ["React", "Vue"],
    placeholder: "Add a framework",
  },
};

export const Empty: Story = {
  args: {
    "aria-label": "Empty tags",
    placeholder: "Add a tag",
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState(["Design", "Docs"]);

    return (
      <div className="w-full max-w-sm">
        <TagsInput
          aria-label="Controlled tags"
          onValueChange={setValue}
          placeholder="Add a workflow tag"
          value={value}
        />
      </div>
    );
  },
};
