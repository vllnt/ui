import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AccordionProps } from "./accordion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function tabOrder(root: HTMLElement): (null | string)[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)]
    .filter((element) => !element.closest("[inert], [hidden]"))
    .map((element) => element.textContent);
}

function expectWired(
  scope: Pick<typeof screen, "getByRole">,
  name: string,
): void {
  const button = scope.getByRole("button", { name });
  const region = scope.getByRole("region", { hidden: true, name });
  expect(button.id).not.toBe("");
  expect(region.id).not.toBe("");
  expect(button).toHaveAttribute("aria-controls", region.id);
  expect(region).toHaveAttribute("aria-labelledby", button.id);
}

function Faq(props: Pick<AccordionProps, "defaultValue" | "type">) {
  return (
    <Accordion {...props}>
      <AccordionItem value="shipping">
        <AccordionTrigger value="shipping">Shipping</AccordionTrigger>
        <AccordionContent value="shipping">
          <a href="/shipping">Shipping policy</a>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger value="returns">Returns</AccordionTrigger>
        <AccordionContent value="returns">
          <a href="/returns">Returns policy</a>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function panel(name: string): HTMLElement {
  return screen.getByRole("region", { hidden: true, name });
}

function trigger(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

describe("Accordion", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(
      <Accordion className="custom-class">Test</Accordion>,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  describe("trigger and panel wiring", () => {
    it.each(["Shipping", "Returns"])(
      "points aria-controls at the %s panel and aria-labelledby back at its trigger",
      (name) => {
        render(<Faq />);

        expectWired(screen, name);
      },
    );

    it("keeps ids unique across Accordions that reuse the same item values", () => {
      render(
        <>
          <div data-testid="first">
            <Faq />
          </div>
          <div data-testid="second">
            <Faq />
          </div>
        </>,
      );

      const ids = [
        ...document.querySelectorAll<HTMLElement>(
          "button[aria-controls], [role='region']",
        ),
      ].map((element) => element.id);
      expect(ids).toHaveLength(8);
      expect(ids.every((id) => id !== "")).toBe(true);
      expect(new Set(ids).size).toBe(ids.length);

      expectWired(within(screen.getByTestId("first")), "Shipping");
      expectWired(within(screen.getByTestId("second")), "Shipping");
    });

    it("builds valid, collision-free ids from values with spaces and symbols", () => {
      render(
        <Accordion>
          {["billing & plans", "billing_&_plans", "billing and plans"].map(
            (value) => (
              <AccordionItem key={value} value={value}>
                <AccordionTrigger value={value}>{value}</AccordionTrigger>
                <AccordionContent value={value}>
                  {value} answer
                </AccordionContent>
              </AccordionItem>
            ),
          )}
        </Accordion>,
      );

      const buttons = screen.getAllByRole("button");
      const ids = buttons.flatMap((button) => [
        button.id,
        button.getAttribute("aria-controls") ?? "",
      ]);
      expect(ids.every((id) => /^\S+$/.test(id))).toBe(true);
      expect(new Set(ids).size).toBe(6);

      expect(
        buttons.map((button) =>
          document
            .querySelector(`[id="${button.getAttribute("aria-controls")}"]`)
            ?.getAttribute("aria-labelledby"),
        ),
      ).toEqual(buttons.map((button) => button.id));
    });
  });

  describe("closed panels", () => {
    it("takes a closed panel out of the accessibility tree and the tab order", () => {
      const { container } = render(<Faq />);

      expect(tabOrder(container)).toEqual(["Shipping", "Returns"]);
      expect(panel("Shipping")).toHaveAttribute("inert");
      expect(panel("Returns")).toHaveAttribute("inert");
    });

    it("makes a panel readable and reachable by Tab once it opens", () => {
      const { container } = render(<Faq />);

      fireEvent.click(trigger("Shipping"));

      expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "true");
      expect(tabOrder(container)).toEqual([
        "Shipping",
        "Shipping policy",
        "Returns",
      ]);
      expect(panel("Shipping")).not.toHaveAttribute("inert");
      expect(panel("Returns")).toHaveAttribute("inert");
      expect(
        within(panel("Shipping")).getByRole("link", {
          name: "Shipping policy",
        }),
      ).toBeVisible();
    });

    it("starts a defaultValue panel open and not inert", () => {
      const { container } = render(<Faq defaultValue="returns" />);

      expect(tabOrder(container)).toEqual([
        "Shipping",
        "Returns",
        "Returns policy",
      ]);
      expect(panel("Returns")).not.toHaveAttribute("inert");
      expect(panel("Shipping")).toHaveAttribute("inert");
    });

    it("hides a panel again when its trigger is toggled closed", () => {
      const { container } = render(<Faq defaultValue="shipping" />);

      fireEvent.click(trigger("Shipping"));

      expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "false");
      expect(tabOrder(container)).toEqual(["Shipping", "Returns"]);
      expect(panel("Shipping")).toHaveAttribute("inert");
    });
  });

  describe("type", () => {
    it("closes the other item and makes it inert again in single mode", () => {
      const { container } = render(
        <Faq defaultValue="shipping" type="single" />,
      );

      expect(tabOrder(container)).toEqual([
        "Shipping",
        "Shipping policy",
        "Returns",
      ]);

      fireEvent.click(trigger("Returns"));

      expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "false");
      expect(tabOrder(container)).toEqual([
        "Shipping",
        "Returns",
        "Returns policy",
      ]);
      expect(panel("Shipping")).toHaveAttribute("inert");
      expect(panel("Returns")).not.toHaveAttribute("inert");
    });

    it("keeps every opened item reachable in multiple mode", () => {
      const { container } = render(<Faq type="multiple" />);

      fireEvent.click(trigger("Shipping"));
      fireEvent.click(trigger("Returns"));

      expect(tabOrder(container)).toEqual([
        "Shipping",
        "Shipping policy",
        "Returns",
        "Returns policy",
      ]);
      expect(panel("Shipping")).not.toHaveAttribute("inert");
      expect(panel("Returns")).not.toHaveAttribute("inert");
    });
  });
});
