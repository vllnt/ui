import type { Meta, StoryObj } from "@storybook/react-vite";

import { LangProvider } from "./lang-provider";

const meta = {
  component: LangProvider,
  title: "Utility/LangProvider",
} satisfies Meta<typeof LangProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
