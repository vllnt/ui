import type { Meta, StoryObj } from "@storybook/react-vite";

import { TutorialFilters } from "./tutorial-filters";

const meta = {
  args: {
    currentDifficulty: "all",
    currentTags: [],
    labels: {
      activeFilters: "Active filters:",
      clear: "Clear",
      clearAll: "Clear all",
      difficulty: {
        advanced: "Advanced",
        all: "All Levels",
        beginner: "Beginner",
        intermediate: "Intermediate",
      },
      difficultyLabel: "Difficulty",
      searchFilter: "Search",
      searchLabel: "Search tutorials",
      searchPlaceholder: "Search by title or keyword...",
      tagsLabel: "Topics",
    },
    onFilterChange: () => {},
    searchQuery: "",
    tags: ["React", "TypeScript", "Tailwind", "Components"],
  },
  component: TutorialFilters,
  title: "Learning/TutorialFilters",
} satisfies Meta<typeof TutorialFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
