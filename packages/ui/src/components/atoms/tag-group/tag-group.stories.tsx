import type { Meta, StoryObj } from "@storybook/react-vite";

import { TagGroup, TagGroupItem } from "./tag-group";

const meta = {
  component: TagGroup,
  title: "Form/TagGroup",
} satisfies Meta<typeof TagGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Selectable: Story = {
  render: () => (
    <TagGroup defaultValue={["design"]} label="Topics" selectionMode="multiple">
      <TagGroupItem value="design">Design</TagGroupItem>
      <TagGroupItem value="engineering">Engineering</TagGroupItem>
      <TagGroupItem value="product">Product</TagGroupItem>
    </TagGroup>
  ),
};

export const Removable: Story = {
  render: () => (
    <TagGroup label="Applied filters">
      <TagGroupItem onRemove={() => undefined} value="open">
        Open
      </TagGroupItem>
      <TagGroupItem onRemove={() => undefined} value="mine">
        Assigned to me
      </TagGroupItem>
    </TagGroup>
  ),
};
