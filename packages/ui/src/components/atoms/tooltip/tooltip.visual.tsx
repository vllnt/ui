import { expect, test } from "@playwright/experimental-ct-react";

import { Button } from "../button/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

test.describe("Tooltip Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await expect(page).toHaveScreenshot("tooltip-default.png");
  });
});
