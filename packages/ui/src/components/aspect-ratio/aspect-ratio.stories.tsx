import type { Meta, StoryObj } from "@storybook/react-vite";

import { AspectRatio } from "./aspect-ratio";

const meta = {
  component: AspectRatio,
  title: "Components/AspectRatio",
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
