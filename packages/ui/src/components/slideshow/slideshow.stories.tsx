import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slideshow } from "./slideshow";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    completedSections: new Set<string>(),
    currentIndex: 0,
    onComplete: () => {},
    onExit: () => {},
    onNavigate: () => {},
    onToggleSection: () => {},
    renderContent: () => "Slide content here.",
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "setup", title: "Setup" },
      { id: "advanced", title: "Advanced" },
    ],
    title: "Tutorial Slideshow",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: Slideshow,
  title: "Content/Slideshow",
} satisfies Meta<typeof Slideshow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
