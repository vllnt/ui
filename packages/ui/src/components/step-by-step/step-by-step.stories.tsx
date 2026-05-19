import type { Meta, StoryObj } from "@storybook/react-vite";

import { Step, StepByStep } from "./step-by-step";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    as: "h3",
    children: null,
    title: "Getting Started",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: StepByStep,
  title: "Learning/StepByStep",
} satisfies Meta<typeof StepByStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    as: "h3",
    children: null,
    title: "Getting Started",
  },
  render: () => (
    <StepByStep title="Getting Started">
      <Step title="Install dependencies">Run npm install to get started.</Step>
      <Step title="Configure settings">Update your config file.</Step>
      <Step title="Start coding">Begin building your project.</Step>
    </StepByStep>
  ),
};
