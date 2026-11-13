import type { Meta, StoryObj } from "@storybook/react-vite";
import { Rocket } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { CtaBand } from "./cta-band";

const meta = {
  args: {
    actions: (
      <>
        <Button>Get started</Button>
        <Button variant="outline">Talk to sales</Button>
      </>
    ),
    description: "Free for personal projects. No credit card required.",
    title: "Ship your next release faster",
  },
  argTypes: {
    headingLevel: {
      control: "select",
      options: [1, 2, 3, 4, 5, 6],
    },
    tone: {
      control: "select",
      options: ["default", "muted"],
    },
  },
  component: CtaBand,
  parameters: {
    layout: "fullscreen",
  },
  title: "Layout/CtaBand",
} satisfies Meta<typeof CtaBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Muted: Story = {
  args: {
    tone: "muted",
  },
};

export const WithIconAndDivider: Story = {
  args: {
    divider: true,
    icon: <Rocket />,
  },
};

export const SingleAction: Story = {
  args: {
    actions: <Button>Get started</Button>,
    description: undefined,
  },
};

export const ThreeActions: Story = {
  args: {
    actions: (
      <>
        <Button>Get started</Button>
        <Button variant="outline">Talk to sales</Button>
        <Button variant="ghost">Read the docs</Button>
      </>
    ),
    tone: "muted",
  },
};
