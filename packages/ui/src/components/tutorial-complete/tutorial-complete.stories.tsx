import type { Meta, StoryObj } from "@storybook/react-vite";

import { TutorialComplete } from "./tutorial-complete";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    backHref: "/tutorials",
    completedSections: new Set(["intro", "getting-started", "advanced"]),
    completionPercent: 100,
    labels: {
      backToTutorials: "Back to Tutorials",
      profileName: "Jane Doe",
      profileTagline: "React Developer",
      relatedContent: "Continue Learning",
      reviewSections: "Review Sections",
      shareOn: "Share on",
      shareTitle: "I just completed this tutorial!",
      startOver: "Start Over",
      tutorialComplete: "Tutorial Complete!",
      tutorialFinished: "Tutorial Finished",
      youveCompletedAll: "You've completed all sections of",
      youveFinishedWith: "You've finished with",
    },
    onGoToSection: () => {},
    onRestart: () => {},
    relatedContent: [
      { href: "/next-tutorial", title: "Next Steps", type: "Tutorial" },
    ],
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "getting-started", title: "Getting Started" },
      { id: "advanced", title: "Advanced Concepts" },
    ],
    shareUrl: "https://example.com/tutorial",
    socialLinks: [
      { href: "https://twitter.com", label: "Twitter" },
    ],
    title: "React Fundamentals",
  },
  argTypes: {
    titleAs: {
      control: "select",
      description: "Override the rendered title heading tag.",
      options: headingTagOptions,
    },
    sectionLabelAs: {
      control: "select",
      description: "Override the rendered section label heading tag.",
      options: headingTagOptions,
    },
  },
  component: TutorialComplete,
  title: "Learning/TutorialComplete",
} satisfies Meta<typeof TutorialComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    titleAs: "h2",
    sectionLabelAs: "h4",
  },
};
