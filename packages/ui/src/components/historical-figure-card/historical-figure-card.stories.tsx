import type { Meta, StoryObj } from "@storybook/react-vite";

import { HistoricalFigureCard } from "./historical-figure-card";

const meta = {
  args: {
    birth: { place: "Vinci, Italy", year: 1452 },
    death: { place: "Amboise, France", year: 1519 },
    era: "Renaissance",
    fields: ["Art", "Science", "Engineering", "Anatomy"],
    name: "Leonardo da Vinci",
    quote: {
      source: "Notebooks",
      text: "Learning never exhausts the mind.",
    },
    title: "Polymath",
    works: ["Mona Lisa", "The Last Supper", "Vitruvian Man"],
  },
  component: HistoricalFigureCard,
  title: "Educational/HistoricalFigureCard",
} satisfies Meta<typeof HistoricalFigureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithConnections: Story = {
  args: {
    connections: [
      { name: "Michelangelo", relation: "Contemporary/rival" },
      { name: "Lorenzo de Medici", relation: "Patron" },
      { name: "Cesare Borgia", relation: "Employer" },
    ],
    profileHref: "/figures/da-vinci",
  },
};

export const WithBiography: Story = {
  args: {
    biography:
      "Born out of wedlock to a notary and a peasant woman, Leonardo was apprenticed to Andrea del Verrocchio in Florence. He served the Sforza court in Milan and later returned to Florence, where he painted the Mona Lisa. He spent his final years in France under the patronage of Francis I.",
  },
};

export const Antiquity: Story = {
  args: {
    birth: { place: "Arpinum, Roman Republic", year: -106 },
    death: { place: "Formia", year: -43 },
    era: "Roman Republic",
    fields: ["Philosophy", "Politics", "Law", "Rhetoric"],
    name: "Marcus Tullius Cicero",
    quote: undefined,
    title: "Statesman & orator",
    works: ["De Oratore", "De Re Publica"],
  },
};

export const Minimal: Story = {
  args: {
    birth: undefined,
    connections: undefined,
    death: undefined,
    era: undefined,
    fields: undefined,
    name: "Marie Curie",
    quote: undefined,
    title: "Physicist & chemist",
    works: undefined,
  },
};
