import type { Meta, StoryObj } from "@storybook/react-vite";

import { TutorialComplete } from "./tutorial-complete";

const noop = (): void => undefined;

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
    onGoToSection: noop,
    onRestart: noop,
    relatedContent: [
      { href: "/next-tutorial", title: "Next Steps", type: "Tutorial" },
    ],
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "getting-started", title: "Getting Started" },
      { id: "advanced", title: "Advanced Concepts" },
    ],
    shareUrl: "https://example.com/tutorial",
    title: "React Fundamentals",
  },
  component: TutorialComplete,
  title: "Learning/TutorialComplete",
} satisfies Meta<typeof TutorialComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
