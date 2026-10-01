import { expect, test } from "@playwright/experimental-ct-react";

import {
  ModelComparison,
  ModelComparisonColumn,
  ModelComparisonMeta,
  ModelComparisonVote,
} from "./model-comparison";

const noop = (): void => {
  return;
};

test.describe("ModelComparison Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <ModelComparison prompt="Explain closures in JavaScript">
        <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
          <p>
            A closure is a function bundled together with references to its
            surrounding state.
          </p>
          <ModelComparisonMeta cost="$0.003" latency="0.8s" tokens={320} />
        </ModelComparisonColumn>
        <ModelComparisonColumn label="GPT-4o" model="gpt-4o">
          <p>
            Closures let an inner function remember the variables of the
            outer function it was created in.
          </p>
          <ModelComparisonMeta cost="$0.005" latency="1.1s" tokens={410} />
        </ModelComparisonColumn>
        <ModelComparisonVote onVote={noop} />
      </ModelComparison>,
    );
    await expect(component).toHaveScreenshot("model-comparison-default.png");
  });
});
