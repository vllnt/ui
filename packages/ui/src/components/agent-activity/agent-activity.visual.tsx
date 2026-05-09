import { expect, test } from "@playwright/experimental-ct-react";

import {
  AgentActivity,
  AgentStep,
  AgentStepDetail,
  AgentStepDuration,
  AgentStepProgress,
  AgentStepTitle,
} from "./agent-activity";

test.describe("AgentActivity Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <AgentActivity elapsed="3.2s" status="running">
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
      </AgentActivity>,
    );
    await expect(component).toHaveScreenshot("agent-activity-default.png");
  });

  test("error-state", async ({ mount }) => {
    const component = await mount(
      <AgentActivity status="error">
        <AgentStep status="completed">
          <AgentStepTitle>Searching codebase</AgentStepTitle>
        </AgentStep>
        <AgentStep status="error">
          <AgentStepTitle>Reading auth.ts</AgentStepTitle>
          <AgentStepDetail>Permission denied.</AgentStepDetail>
        </AgentStep>
        <AgentStep status="skipped">
          <AgentStepTitle>Writing fix</AgentStepTitle>
        </AgentStep>
      </AgentActivity>,
    );
    await expect(component).toHaveScreenshot("agent-activity-error-state.png");
  });
});
