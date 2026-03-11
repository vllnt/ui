import type { Meta, StoryObj } from "@storybook/react-vite";

import { NavbarSaas } from "./navbar-saas";

const meta = {
  component: NavbarSaas,
  title: "Components/NavbarSaas",
} satisfies Meta<typeof NavbarSaas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
