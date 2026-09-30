import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  AgentActivity,
  AgentStep,
  AgentStepDetail,
  AgentStepDuration,
  AgentStepProgress,
  AgentStepTitle,
} from "./agent-activity";

const meta = {
  args: {
    elapsed: "3.2s",
    status: "running",
  },
  argTypes: {
    status: {
      control: "select",
      options: ["idle", "running", "completed", "error"],
    },
  },
  component: AgentActivity,
  title: "AI/AgentActivity",
} satisfies Meta<typeof AgentActivity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <AgentActivity {...args}>
      <AgentStep status="completed">
        <AgentStepTitle>Searching codebase</AgentStepTitle>
        <AgentStepDuration>1.2s</AgentStepDuration>
        <AgentStepDetail>Found 12 files matching "auth".</AgentStepDetail>
      </AgentStep>
      <AgentStep status="completed">
        <AgentStepTitle>Reading auth.ts</AgentStepTitle>
        <AgentStepDuration>0.4s</AgentStepDuration>
      </AgentStep>
      <AgentStep status="running">
        <AgentStepTitle>Writing fix</AgentStepTitle>
        <AgentStepProgress value={60} />
      </AgentStep>
      <AgentStep status="pending">
        <AgentStepTitle>Running tests</AgentStepTitle>
      </AgentStep>
    </AgentActivity>
  ),
};

export const Completed: Story = {
  args: {
    elapsed: "8.4s",
    status: "completed",
  },
  render: (args) => (
    <AgentActivity {...args}>
      <AgentStep status="completed">
        <AgentStepTitle>Searching codebase</AgentStepTitle>
        <AgentStepDuration>1.2s</AgentStepDuration>
      </AgentStep>
      <AgentStep status="completed">
        <AgentStepTitle>Writing fix</AgentStepTitle>
        <AgentStepDuration>4.7s</AgentStepDuration>
      </AgentStep>
      <AgentStep status="completed">
        <AgentStepTitle>Running tests</AgentStepTitle>
        <AgentStepDuration>2.5s</AgentStepDuration>
        <AgentStepDetail>14 / 14 passed.</AgentStepDetail>
      </AgentStep>
    </AgentActivity>
  ),
};

export const ErrorState: Story = {
  args: {
    elapsed: "1.6s",
    status: "error",
  },
  name: "Error state",
  render: (args) => (
    <AgentActivity {...args}>
      <AgentStep status="completed">
        <AgentStepTitle>Searching codebase</AgentStepTitle>
        <AgentStepDuration>1.2s</AgentStepDuration>
      </AgentStep>
      <AgentStep status="error">
        <AgentStepTitle>Reading auth.ts</AgentStepTitle>
        <AgentStepDetail>Permission denied.</AgentStepDetail>
      </AgentStep>
      <AgentStep status="skipped">
        <AgentStepTitle>Writing fix</AgentStepTitle>
      </AgentStep>
    </AgentActivity>
  ),
};

export const CollapsedDetails: Story = {
  args: {
    elapsed: "8.4s",
    status: "completed",
  },
  name: "Collapsed details",
  render: (args) => (
    <AgentActivity {...args}>
      <AgentStep defaultOpen={false} status="completed">
        <AgentStepTitle>Searching codebase</AgentStepTitle>
        <AgentStepDuration>1.2s</AgentStepDuration>
        <AgentStepDetail>Found 12 files matching "auth".</AgentStepDetail>
      </AgentStep>
      <AgentStep defaultOpen={false} status="completed">
        <AgentStepTitle>Writing fix</AgentStepTitle>
        <AgentStepDuration>4.7s</AgentStepDuration>
        <AgentStepDetail>
          Edited 3 files (login.ts, session.ts, auth.test.ts).
        </AgentStepDetail>
      </AgentStep>
    </AgentActivity>
  ),
};
