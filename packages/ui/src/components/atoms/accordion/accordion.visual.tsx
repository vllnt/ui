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

type Viewport = { height: number; width: number };

function defineKeyboardTests(label: string, viewport: Viewport): void {
  test.describe(`Accordion keyboard (${label})`, () => {
    test.use({ viewport });

    test("Tab skips a link in a closed panel and reaches it once opened", async ({
      mount,
      page,
    }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(String(error)));

      await mount(
        <div className="p-4">
          <button type="button">Before</button>
          <Accordion type="single">
            <AccordionItem value="shipping">
              <AccordionTrigger value="shipping">Shipping</AccordionTrigger>
              <AccordionContent value="shipping">
                <a href="#shipping-policy">Shipping policy</a>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger value="returns">Returns</AccordionTrigger>
              <AccordionContent value="returns">
                <a href="#returns-policy">Returns policy</a>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <button type="button">After</button>
        </div>,
      );

      const before = page.getByRole("button", { name: "Before" });
      const after = page.getByRole("button", { name: "After" });
      const shipping = page.getByRole("button", { name: "Shipping" });
      const returns = page.getByRole("button", { name: "Returns" });
      const shippingLink = page.getByRole("link", { name: "Shipping policy" });
      const returnsLink = page.getByRole("link", { name: "Returns policy" });

      const client = await page.context().newCDPSession(page);
      await client.send("Accessibility.enable");
      const inAccessibilityTree = async (name: string): Promise<boolean> => {
        const { nodes } = await client.send("Accessibility.getFullAXTree");
        return nodes.some((node) => !node.ignored && node.name?.value === name);
      };

      await expect.poll(() => inAccessibilityTree("Shipping policy")).toBe(false);
      await expect.poll(() => inAccessibilityTree("Returns policy")).toBe(false);

      await before.focus();
      await page.keyboard.press("Tab");
      await expect(shipping).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(returns).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(after).toBeFocused();

      await shipping.focus();
      await page.keyboard.press("Enter");
      await expect(shipping).toHaveAttribute("aria-expanded", "true");
      await expect(shippingLink).toBeVisible();
      await expect.poll(() => inAccessibilityTree("Shipping policy")).toBe(true);
      await page.keyboard.press("Tab");
      await expect(shippingLink).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(returns).toBeFocused();
      await expect.poll(() => inAccessibilityTree("Returns policy")).toBe(false);

      await page.keyboard.press("Enter");
      await expect(returns).toHaveAttribute("aria-expanded", "true");
      await expect(shipping).toHaveAttribute("aria-expanded", "false");
      await expect(returnsLink).toBeVisible();
      await expect.poll(() => inAccessibilityTree("Returns policy")).toBe(true);
      await expect.poll(() => inAccessibilityTree("Shipping policy")).toBe(false);
      await page.keyboard.press("Shift+Tab");
      await expect(shipping).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(returns).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(returnsLink).toBeFocused();

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    });
  });
}

defineKeyboardTests("desktop 1440", { height: 900, width: 1440 });
defineKeyboardTests("mobile 390", { height: 844, width: 390 });
