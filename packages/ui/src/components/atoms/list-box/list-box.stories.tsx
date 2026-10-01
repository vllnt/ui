import type { Meta, StoryObj } from "@storybook/react-vite";

import { ListBox, ListBoxItem } from "./list-box";

const meta = {
  component: ListBox,
  title: "Form/ListBox",
} satisfies Meta<typeof ListBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleSelect: Story = {
  render: () => (
    <ListBox className="w-64" defaultValue={["pst"]} label="Timezone">
      <ListBoxItem value="utc">UTC</ListBoxItem>
      <ListBoxItem value="est">Eastern</ListBoxItem>
      <ListBoxItem value="pst">Pacific</ListBoxItem>
    </ListBox>
  ),
};

export const MultiSelect: Story = {
  render: () => (
    <ListBox
      className="w-64"
      defaultValue={["react"]}
      label="Frameworks"
      selectionMode="multiple"
    >
      <ListBoxItem value="react">React</ListBoxItem>
      <ListBoxItem value="vue">Vue</ListBoxItem>
      <ListBoxItem disabled value="angular">
        Angular
      </ListBoxItem>
    </ListBox>
  ),
};
