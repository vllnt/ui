import type { Meta, StoryObj } from "@storybook/react-vite";

import { ShareDialog } from "./share-dialog";

const meta = {
  component: ShareDialog,
  title: "Components/ShareDialog",
} satisfies Meta<typeof ShareDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
