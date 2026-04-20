import { expect, test } from "@playwright/experimental-ct-react";

import { DataList, DataListItem, DataListLabel, DataListValue } from "./data-list";

test.describe("DataList Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-[520px] p-4">
        <DataList>
          <DataListItem>
            <DataListLabel>Environment</DataListLabel>
            <DataListValue>Production</DataListValue>
          </DataListItem>
          <DataListItem>
            <DataListLabel>Latency budget</DataListLabel>
            <DataListValue>120 ms p95</DataListValue>
          </DataListItem>
          <DataListItem>
            <DataListLabel>Deploy window</DataListLabel>
            <DataListValue>Tue / Thu • 09:00 UTC</DataListValue>
          </DataListItem>
        </DataList>
      </div>,
    );

    await expect(page).toHaveScreenshot("data-list-default.png");
  });
});