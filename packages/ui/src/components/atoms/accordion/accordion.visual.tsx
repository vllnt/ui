import { expect, test } from "@playwright/experimental-ct-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

test.describe("Accordion Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <Accordion defaultValue="item-1" type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger value="item-1">
            What is this component?
          </AccordionTrigger>
          <AccordionContent value="item-1">
            A vertically stacked set of interactive headings that reveal content.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger value="item-2">
            Is it accessible?
          </AccordionTrigger>
          <AccordionContent value="item-2">
            Yes, it follows WAI-ARIA accordion pattern.
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    await expect(page).toHaveScreenshot("accordion-default.png");
  });
});
