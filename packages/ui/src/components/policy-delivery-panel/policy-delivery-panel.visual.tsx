import { expect, test } from "@playwright/experimental-ct-react";

import { PolicyDeliveryPanel } from "./policy-delivery-panel";

test.describe("PolicyDeliveryPanel Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-72 p-4">
        <PolicyDeliveryPanel
          policies={[
            { id: "pii", name: "PII redaction", status: "enforced" },
            {
              description: "60 / s soft cap",
              id: "rate",
              name: "Rate limiting",
              status: "advisory",
            },
            {
              description: "rolled out 12 % of traffic",
              id: "exp",
              name: "Experiment B",
              status: "disabled",
            },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "policy-delivery-panel-default.png",
    );
  });
});
