import type { Meta, StoryObj } from "@storybook/react-vite";

import { KeyConcept } from "./key-concept";

const meta = {
  args: {
    children: "KeyConcept",
  },
  component: KeyConcept,
  title: "Learning/KeyConcept",
} satisfies Meta<typeof KeyConcept>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
