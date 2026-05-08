import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  GeographyQuizMap,
  GeographyQuizMapPrompt,
  GeographyQuizMapResults,
  GeographyQuizMapScore,
  type QuizQuestion,
  type QuizRegion,
} from "./geography-quiz-map";

const REGIONS: QuizRegion[] = [
  {
    coordinates: [
      [-5, 51],
      [10, 51],
      [10, 41],
      [-5, 41],
      [-5, 51],
    ],
    id: "FR",
    name: "France",
  },
  {
    coordinates: [
      [5, 55],
      [15, 55],
      [15, 47],
      [5, 47],
      [5, 55],
    ],
    id: "DE",
    name: "Germany",
  },
  {
    coordinates: [
      [-9, 44],
      [3, 44],
      [3, 36],
      [-9, 36],
      [-9, 44],
    ],
    id: "ES",
    name: "Spain",
  },
  {
    coordinates: [
      [6, 47],
      [18, 47],
      [18, 37],
      [6, 37],
      [6, 47],
    ],
    id: "IT",
    name: "Italy",
  },
  {
    coordinates: [
      [21, 60],
      [40, 60],
      [40, 50],
      [21, 50],
      [21, 60],
    ],
    id: "PL",
    name: "Poland",
  },
];

const QUESTIONS: QuizQuestion[] = [
  { answerRegionId: "FR", id: "q1", prompt: "Click on France" },
  { answerRegionId: "DE", id: "q2", prompt: "Click on Germany" },
  { answerRegionId: "ES", id: "q3", prompt: "Click on Spain" },
  { answerRegionId: "IT", id: "q4", prompt: "Click on Italy" },
  { answerRegionId: "PL", id: "q5", prompt: "Click on Poland" },
];

const meta = {
  args: {
    questions: QUESTIONS,
    regions: REGIONS,
  },
  component: GeographyQuizMap,
  title: "Educational/GeographyQuizMap",
} satisfies Meta<typeof GeographyQuizMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <GeographyQuizMap {...args}>
      <GeographyQuizMapPrompt />
      <GeographyQuizMapScore />
      <GeographyQuizMapResults />
    </GeographyQuizMap>
  ),
};

export const PromptOnly: Story = {
  render: (args) => (
    <GeographyQuizMap {...args}>
      <GeographyQuizMapPrompt />
    </GeographyQuizMap>
  ),
};

export const ShortQuiz: Story = {
  args: {
    questions: QUESTIONS.slice(0, 2),
  },
  render: (args) => (
    <GeographyQuizMap {...args}>
      <GeographyQuizMapPrompt />
      <GeographyQuizMapScore />
      <GeographyQuizMapResults />
    </GeographyQuizMap>
  ),
};
