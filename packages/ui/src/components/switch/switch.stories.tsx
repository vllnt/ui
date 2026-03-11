import type { Meta, StoryObj } from "@storybook/react-vite";

import { Switch } from "./switch";

const meta = {
  component: Switch,
  title: "Components/Switch",
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
