import type { Meta, StoryObj } from "@storybook/react-vite";

import { ContentIntro } from "./content-intro";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    completedSections: new Set<string>(),
    estimatedTime: "10 min",
    onGoToSection: () => {},
    onStart: () => {},
    renderIntroContent: () => "Welcome to this tutorial.",
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "basics", title: "Basics" },
    ],
    title: "Getting Started",
  },
  argTypes: {
    titleAs: {
      control: "select",
      description: "Override the rendered title heading tag.",
      options: headingTagOptions,
    },
    tocLabelAs: {
      control: "select",
      description: "Override the rendered table-of-contents label heading tag.",
      options: headingTagOptions,
    },
  },
  component: ContentIntro,
  title: "Content/ContentIntro",
} satisfies Meta<typeof ContentIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    titleAs: "h2",
    tocLabelAs: "h4",
  },
};
