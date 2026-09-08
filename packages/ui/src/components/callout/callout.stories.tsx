import type { Meta, StoryObj } from "@storybook/react-vite";

import { Callout, CalloutBody, CalloutHeader } from "./callout";
import { Heading } from "../heading";
import { Text } from "../text";

const meta = {
  args: {
    children: "Callout",
  },
  component: Callout,
  title: "Content/Callout",
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Neutral: Story = {
  args: {
    variant: "neutral",
    children: "A neutral callout using theme tokens.",
  },
};

export const Composable: Story = {
  args: { composable: true, variant: "neutral", role: "note" },
  render: (args) => (
    <Callout {...args}>
      <CalloutHeader>
        <Heading level={3}>Before you begin</Heading>
      </CalloutHeader>
      <CalloutBody className="mt-2">
        <Text>Choose typography explicitly with foundation primitives.</Text>
      </CalloutBody>
    </Callout>
  ),
};
