import type { Meta, StoryObj } from "@storybook/react-vite";

import { TruncatedText } from "./truncated-text";

const meta = {
  component: TruncatedText,
  title: "Utility/TruncatedText",
} satisfies Meta<typeof TruncatedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
