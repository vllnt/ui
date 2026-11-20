import { expect, test } from "@playwright/experimental-ct-react";

import { OrderSummary } from "./order-summary";

const noop = (): undefined => undefined;

const LINES = [
  { label: "Subtotal", value: "$120.00" },
  { label: "Shipping", value: "$8.00" },
  { label: "Tax", value: "$10.24" },
];

const TOTAL = { label: "Total", value: "$138.24" };

test.describe("OrderSummary Visual", () => {
  test("desktop", async ({ mount, page }) => {
    await mount(
      <OrderSummary
        className="max-w-md"
        lines={LINES}
        promo={{ onApply: noop, onValueChange: noop, value: "" }}
        title="Order summary"
        total={TOTAL}
      />,
    );
    await expect(page).toHaveScreenshot("order-summary-desktop.png");
  });

  test("phone", async ({ mount, page }) => {
    await mount(
      <OrderSummary
        className="max-w-sm"
        layout="phone"
        lines={LINES}
        promo={{ onApply: noop, onValueChange: noop, value: "" }}
        title="Order summary"
        total={TOTAL}
      />,
    );
    await expect(page).toHaveScreenshot("order-summary-phone.png");
  });

  test("promo applying", async ({ mount, page }) => {
    await mount(
      <OrderSummary
        className="max-w-md"
        lines={LINES}
        promo={{
          onApply: noop,
          onValueChange: noop,
          status: "applying",
          value: "SAVE10",
        }}
        title="Order summary"
        total={TOTAL}
      />,
    );
    await expect(page.getByRole("button", { name: /apply/i })).toBeDisabled();
    await expect(page).toHaveScreenshot("order-summary-promo-applying.png");
  });

  test("promo error", async ({ mount, page }) => {
    await mount(
      <OrderSummary
        className="max-w-md"
        lines={LINES}
        promo={{
          hint: "This code has expired.",
          onApply: noop,
          onValueChange: noop,
          status: "error",
          value: "OLD10",
        }}
        title="Order summary"
        total={TOTAL}
      />,
    );
    await expect(page.getByLabel("Promo code")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.getByRole("alert")).toHaveText("This code has expired.");
    await expect(page).toHaveScreenshot("order-summary-promo-error.png");
  });

  test("checkout loading", async ({ mount, page }) => {
    await mount(
      <OrderSummary
        checkoutLoading
        className="max-w-md"
        lines={LINES}
        title="Order summary"
        total={TOTAL}
      />,
    );
    await expect(page.getByRole("button", { name: /checkout/i })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await expect(page).toHaveScreenshot("order-summary-checkout-loading.png");
  });

  test("user flow", async ({ mount, page }) => {
    const typed: string[] = [];
    let applied = 0;
    let checkedOut = 0;

    await mount(
      <OrderSummary
        className="max-w-md"
        lines={LINES}
        onCheckout={() => {
          checkedOut += 1;
        }}
        promo={{
          onApply: () => {
            applied += 1;
          },
          onValueChange: (value: string) => {
            typed.push(value);
          },
          value: "",
        }}
        title="Order summary"
        total={TOTAL}
      />,
    );

    await page.getByLabel("Promo code").fill("SAVE10");
    await page.getByRole("button", { name: "Apply" }).click();
    await page.getByRole("button", { name: "Checkout" }).click();

    expect(typed).toEqual(["SAVE10"]);
    expect(applied).toBe(1);
    expect(checkedOut).toBe(1);
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      errors.push(String(error));
    });

    await page.setViewportSize({ height: 844, width: 390 });
    await mount(
      <OrderSummary
        layout="phone"
        lines={LINES}
        promo={{
          hint: "This code has expired.",
          onApply: noop,
          onValueChange: noop,
          status: "error",
          value: "OLD10",
        }}
        title="Order summary"
        total={TOTAL}
      />,
    );

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("order-summary-mobile.png");
    expect(errors).toEqual([]);
  });
});
