// manual
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";

import { FloatingActionButton } from "./floating-action-button";

const meta = {
  args: {
    "aria-label": "Create item",
    children: <Plus aria-hidden="true" className="size-5" />,
    onClick: () => {},
  },
  component: FloatingActionButton,
  title: "Utility/FloatingActionButton",
} satisfies Meta<typeof FloatingActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
