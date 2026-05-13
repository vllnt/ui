import type { Meta, StoryObj } from "@storybook/react-vite";

import { ContentIntro } from "./content-intro";

const meta = {
  args: {
    completedSections: new Set<string>(),
    estimatedTime: "10 min",
    introContent: "Welcome to this tutorial.",
    onGoToSection: () => {},
    onStart: () => {},
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "basics", title: "Basics" },
    ],
    title: "Getting Started",
  },
  component: ContentIntro,
  title: "Content/ContentIntro",
} satisfies Meta<typeof ContentIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
