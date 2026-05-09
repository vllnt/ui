import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  CivilizationCard,
  CivilizationComparison,
} from "./civilization-card";

const meta = {
  args: {
    achievements: ["Aqueducts", "Roads", "Law", "Architecture"],
    capital: "Rome",
    color: "red",
    era: { end: 476, start: -27 },
    leaders: ["Augustus", "Trajan", "Marcus Aurelius"],
    name: "Roman Empire",
    peakPopulation: "70 million",
    region: "Mediterranean",
  },
  argTypes: {
    color: {
      control: "select",
      options: ["amber", "blue", "emerald", "neutral", "purple", "red"],
    },
  },
  component: CivilizationCard,
  title: "Educational/CivilizationCard",
} satisfies Meta<typeof CivilizationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    actionHref: "/civilizations/rome",
  },
};

export const Extant: Story = {
  args: {
    achievements: ["Constitution", "Industrial revolution", "Internet"],
    capital: "Washington, D.C.",
    color: "blue",
    era: { start: 1776 },
    leaders: ["Lincoln", "Roosevelt"],
    name: "United States",
    peakPopulation: "335 million",
    region: "North America",
  },
};

export const Comparison: Story = {
  render: (args) => (
    <CivilizationComparison>
      <CivilizationCard {...args} />
      <CivilizationCard
        achievements={["Paper", "Silk Road", "Bureaucracy"]}
        capital="Chang'an"
        color="amber"
        era={{ end: 220, start: -202 }}
        leaders={["Liu Bang", "Wu of Han"]}
        name="Han Dynasty"
        peakPopulation="60 million"
        region="East Asia"
      />
    </CivilizationComparison>
  ),
};

export const Minimal: Story = {
  args: {
    achievements: undefined,
    capital: undefined,
    color: "neutral",
    era: undefined,
    leaders: undefined,
    name: "Mystery civilization",
    peakPopulation: undefined,
    region: undefined,
  },
};
