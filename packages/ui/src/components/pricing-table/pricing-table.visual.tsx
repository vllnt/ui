import { expect, test } from "@playwright/experimental-ct-react";

import { PricingPlan, PricingTable } from "./pricing-table";

const FREE_FEATURES = [
  { included: true, label: "5 projects" },
  { included: true, label: "1 GB storage" },
  { included: false, label: "API access" },
];

const PRO_FEATURES = [
  { included: true, label: "Unlimited projects" },
  { included: "100 GB", label: "Storage" },
  { included: true, label: "API access" },
];

test.describe("PricingTable Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <PricingTable>
        <PricingPlan
          cta={{ label: "Get started" }}
          description="For individuals"
          features={FREE_FEATURES}
          name="Free"
          period="/month"
          price="$0"
        />
        <PricingPlan
          badge="Most Popular"
          cta={{ label: "Start trial" }}
          description="For teams"
          features={PRO_FEATURES}
          highlighted
          name="Pro"
          period="/month"
          price="$29"
        />
      </PricingTable>,
    );
    await expect(component).toHaveScreenshot("pricing-table-default.png");
  });

  test("with-toggle", async ({ mount }) => {
    const component = await mount(
      <PricingTable
        periodLabels={{ savings: "Save 20%" }}
        showPeriodToggle
      >
        <PricingPlan
          cta={{ label: "Get started" }}
          features={FREE_FEATURES}
          name="Free"
          period="/month"
          price="$0"
        />
        <PricingPlan
          badge="Most Popular"
          cta={{ label: "Start trial" }}
          features={PRO_FEATURES}
          highlighted
          name="Pro"
          period="/month"
          price="$29"
        />
      </PricingTable>,
    );
    await expect(component).toHaveScreenshot("pricing-table-with-toggle.png");
  });
});
