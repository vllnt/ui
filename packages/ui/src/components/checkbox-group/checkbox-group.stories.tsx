import type { Meta, StoryObj } from "@storybook/react-vite";

import { CheckboxGroup, CheckboxGroupItem } from "./checkbox-group";

const meta = {
  component: CheckboxGroup,
  title: "Form/CheckboxGroup",
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <CheckboxGroup defaultValue={["email"]}>
      <CheckboxGroupItem value="email">Email</CheckboxGroupItem>
      <CheckboxGroupItem value="sms">SMS</CheckboxGroupItem>
      <CheckboxGroupItem value="push">Push notifications</CheckboxGroupItem>
    </CheckboxGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <CheckboxGroup orientation="horizontal">
      <CheckboxGroupItem value="react">React</CheckboxGroupItem>
      <CheckboxGroupItem value="vue">Vue</CheckboxGroupItem>
      <CheckboxGroupItem value="svelte">Svelte</CheckboxGroupItem>
    </CheckboxGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <CheckboxGroup defaultValue={["a"]} disabled>
      <CheckboxGroupItem value="a">Locked A</CheckboxGroupItem>
      <CheckboxGroupItem value="b">Locked B</CheckboxGroupItem>
    </CheckboxGroup>
  ),
};
