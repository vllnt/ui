// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileSection } from "./profile-section";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    dict: {
      profile: {
        name: "Ada Lovelace",
        tagline: "Writes about computing history.",
      },
    },
    imageSource: "https://placehold.co/96x96/png?text=AL",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: ProfileSection,
  title: "Learning/ProfileSection",
} satisfies Meta<typeof ProfileSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = { args: { as: "h2" } };
