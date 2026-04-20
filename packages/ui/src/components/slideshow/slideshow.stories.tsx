import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slideshow } from "./slideshow";

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
  component: Slideshow,
  title: "Content/Slideshow",
} satisfies Meta<typeof Slideshow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
