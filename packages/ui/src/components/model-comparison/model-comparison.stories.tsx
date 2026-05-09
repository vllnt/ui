import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ModelComparison,
  ModelComparisonColumn,
  ModelComparisonMeta,
  ModelComparisonVote,
} from "./model-comparison";

const meta = {
  args: {
    prompt: "Explain closures in JavaScript",
  },
  component: ModelComparison,
  title: "AI/ModelComparison",
} satisfies Meta<typeof ModelComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

const SONNET = `A closure is a function bundled together with references to its surrounding state. Whenever the inner function is called, it can read and modify those variables, even after the outer function has returned.`;

const GPT = `Closures let an inner function remember the variables of the outer function it was created in. They are common when returning a function from a factory, or when using callbacks that need access to data from a parent scope.`;

export const Default: Story = {
  render: (args) => (
    <ModelComparison {...args}>
      <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
        <p>{SONNET}</p>
        <ModelComparisonMeta cost="$0.003" latency="0.8s" tokens={320} />
      </ModelComparisonColumn>
      <ModelComparisonColumn label="GPT-4o" model="gpt-4o">
        <p>{GPT}</p>
        <ModelComparisonMeta cost="$0.005" latency="1.1s" tokens={410} />
      </ModelComparisonColumn>
    </ModelComparison>
  ),
};

export const Blind: Story = {
  args: {
    blindDefault: true,
  },
  render: (args) => (
    <ModelComparison {...args}>
      <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
        <p>{SONNET}</p>
      </ModelComparisonColumn>
      <ModelComparisonColumn label="GPT-4o" model="gpt-4o">
        <p>{GPT}</p>
      </ModelComparisonColumn>
    </ModelComparison>
  ),
};

export const WithVote: Story = {
  render: (args) => (
    <ModelComparison {...args}>
      <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
        <p>{SONNET}</p>
        <ModelComparisonMeta latency="0.8s" tokens={320} />
      </ModelComparisonColumn>
      <ModelComparisonColumn label="GPT-4o" model="gpt-4o">
        <p>{GPT}</p>
        <ModelComparisonMeta latency="1.1s" tokens={410} />
      </ModelComparisonColumn>
      <ModelComparisonVote
        onVote={(vote) => {
          console.log("vote", vote);
        }}
      />
    </ModelComparison>
  ),
};

export const ThreeColumns: Story = {
  render: (args) => (
    <ModelComparison {...args}>
      <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
        <p>{SONNET}</p>
        <ModelComparisonMeta latency="0.8s" tokens={320} />
      </ModelComparisonColumn>
      <ModelComparisonColumn label="GPT-4o" model="gpt-4o">
        <p>{GPT}</p>
        <ModelComparisonMeta latency="1.1s" tokens={410} />
      </ModelComparisonColumn>
      <ModelComparisonColumn label="Haiku" model="claude-haiku-4-5">
        <p>
          A closure remembers the variables of the function it was defined
          inside, even after that function has returned.
        </p>
        <ModelComparisonMeta latency="0.4s" tokens={210} />
      </ModelComparisonColumn>
    </ModelComparison>
  ),
};
