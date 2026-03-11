import type { Meta, StoryObj } from "@storybook/react-vite";

import { ContentIntro } from "./content-intro";

const meta = {
  component: ContentIntro,
  title: "Components/ContentIntro",
} satisfies Meta<typeof ContentIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
