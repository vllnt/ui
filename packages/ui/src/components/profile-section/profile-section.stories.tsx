import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileSection } from "./profile-section";

const meta = {
  component: ProfileSection,
  title: "Components/ProfileSection",
} satisfies Meta<typeof ProfileSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
