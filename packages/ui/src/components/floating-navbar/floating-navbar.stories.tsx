import type { Meta, StoryObj } from "@storybook/react-vite";

import { FloatingNavbar } from "./floating-navbar";

const meta = {
  component: FloatingNavbar,
  title: "Effects/FloatingNavbar",
} satisfies Meta<typeof FloatingNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FloatingNavbar>
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </FloatingNavbar>
  ),
};
