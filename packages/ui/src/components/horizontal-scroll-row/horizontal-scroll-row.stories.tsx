import type { Meta, StoryObj } from "@storybook/react-vite";

import { HorizontalScrollRow } from "./horizontal-scroll-row";

const meta = {
  component: HorizontalScrollRow,
  title: "Components/HorizontalScrollRow",
} satisfies Meta<typeof HorizontalScrollRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
