import type { Meta, StoryObj } from "@storybook/react-vite";

import { Search } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";

const meta = {
  component: InputGroup,
  title: "Form/InputGroup",
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeadingIcon: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
    </InputGroup>
  ),
};

export const TrailingText: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupInput placeholder="0.00" />
      <InputGroupAddon align="trailing">USD</InputGroupAddon>
    </InputGroup>
  ),
};

export const PrefixText: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>https://</InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
    </InputGroup>
  ),
};
