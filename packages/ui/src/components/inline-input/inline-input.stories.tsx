import type { Meta, StoryObj } from "@storybook/react-vite";

import { InlineInput } from "./inline-input";

const meta = {
  component: InlineInput,
  title: "Components/InlineInput",
} satisfies Meta<typeof InlineInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
