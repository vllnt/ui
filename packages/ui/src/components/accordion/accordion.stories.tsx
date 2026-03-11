import type { Meta, StoryObj } from "@storybook/react-vite";

import { Accordion } from "./accordion";

const meta = {
  args: {
    children: "Accordion",
  },
  component: Accordion,
  title: "Components/Accordion",
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
