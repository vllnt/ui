import type { Meta, StoryObj } from "@storybook/react-vite";

import { Step, StepByStep } from "./step-by-step";

const meta = {
  component: StepByStep,
  title: "Learning/StepByStep",
} satisfies Meta<typeof StepByStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <StepByStep title="Getting Started">
      <Step title="Install dependencies">Run npm install to get started.</Step>
      <Step title="Configure settings">Update your config file.</Step>
      <Step title="Start coding">Begin building your project.</Step>
    </StepByStep>
  ),
};
