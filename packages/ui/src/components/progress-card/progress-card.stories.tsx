import type { Meta, StoryObj } from "@storybook/react-vite";

import { ContentCard } from "./progress-card";

const meta = {
  component: ContentCard,
  title: "Components/ProgressCard",
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
