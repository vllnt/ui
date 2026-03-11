import type { Meta, StoryObj } from "@storybook/react-vite";

import { ShareSection } from "./share-section";

const meta = {
  component: ShareSection,
  title: "Components/ShareSection",
} satisfies Meta<typeof ShareSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
