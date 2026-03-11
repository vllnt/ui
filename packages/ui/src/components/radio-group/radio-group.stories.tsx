import type { Meta, StoryObj } from "@storybook/react-vite";

import { RadioGroup } from "./radio-group";

const meta = {
  component: RadioGroup,
  title: "Components/RadioGroup",
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
