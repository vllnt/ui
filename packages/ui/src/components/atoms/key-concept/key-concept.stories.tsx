import type { Meta, StoryObj } from "@storybook/react-vite";

import { Glossary, KeyConcept } from "./key-concept";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    children: "KeyConcept",
  },
  component: KeyConcept,
  title: "Learning/KeyConcept",
} satisfies Meta<typeof KeyConcept>;

export default meta;
type Story = StoryObj<typeof meta>;
type GlossaryStory = StoryObj<typeof Glossary>;

export const Default: Story = {};

export const GlossaryHeadingOverride: GlossaryStory = {
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered glossary title heading tag.",
      options: headingTagOptions,
    },
  },
  args: {
    as: "h2",
    children: <KeyConcept term="Liquidity">Tradable depth near the current price.</KeyConcept>,
    title: "Market terms",
  },
  render: (args) => <Glossary {...args} />,
};
