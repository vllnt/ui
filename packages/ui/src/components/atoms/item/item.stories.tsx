import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bell } from "lucide-react";

import { Button } from "../button/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./item";

const meta = {
  args: {
    size: "default",
    variant: "default",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["default", "sm"],
    },
    variant: {
      control: "inline-radio",
      options: ["default", "muted", "outline"],
    },
  },
  component: Item,
  title: "Form/Item",
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemMedia>
        <Bell />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Notifications</ItemTitle>
        <ItemDescription>Manage how you receive alerts.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </ItemActions>
    </Item>
  ),
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemContent>
        <ItemTitle>Plan</ItemTitle>
        <ItemDescription>Pro — billed annually.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm">Upgrade</Button>
      </ItemActions>
    </Item>
  ),
};
