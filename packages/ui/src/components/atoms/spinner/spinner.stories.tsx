import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from "./spinner";

const meta = {
  component: Spinner,
  title: "Utility/Spinner",
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
