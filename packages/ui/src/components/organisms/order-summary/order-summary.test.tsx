import { type ComponentProps, createRef } from "react";

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  OrderSummary,
  type OrderSummaryPromo,
  type OrderSummaryProps,
} from "./order-summary";

const LINES: OrderSummaryProps["lines"] = [
  { label: "Subtotal", value: "$120.00" },
  { label: "Shipping", value: "$8.00" },
  { label: "Tax", value: "$10.24" },
];

const TOTAL: OrderSummaryProps["total"] = {
  label: "Total",
  value: "$138.24",
};

function buildPromo(
  overrides: Partial<OrderSummaryPromo> = {},
): OrderSummaryPromo {
  return {
    onApply: vi.fn(),
    onValueChange: vi.fn(),
    value: "",
    ...overrides,
  };
}

function renderSummary(
  props: Partial<ComponentProps<typeof OrderSummary>> = {},
): ReturnType<typeof render> {
  return render(<OrderSummary lines={LINES} total={TOTAL} {...props} />);
}

describe("OrderSummary lines", () => {
  it("renders every line as a dt/dd pair and the total last", () => {
    const { container } = renderSummary({ title: "Order summary" });

    const lists = container.querySelectorAll("dl");
    expect(lists).toHaveLength(1);

    const terms = [...container.querySelectorAll("dt")].map(
      (term) => term.textContent,
    );
    const definitions = [...container.querySelectorAll("dd")].map(
      (definition) => definition.textContent,
    );
    expect(terms).toEqual(["Subtotal", "Shipping", "Tax", "Total"]);
    expect(definitions).toEqual(["$120.00", "$8.00", "$10.24", "$138.24"]);
  });

  it("keeps the order of the lines it is given", () => {
    const { container } = renderSummary({
      lines: [
        { label: "Tax", value: "$1.00" },
        { label: "Discount", value: "-$5.00" },
        { label: "Subtotal", value: "$20.00" },
      ],
    });

    const terms = [...container.querySelectorAll("dt")].map(
      (term) => term.textContent,
    );
    expect(terms).toEqual(["Tax", "Discount", "Subtotal", "Total"]);
  });

  it("renders only the total when there are no lines", () => {
    const { container } = renderSummary({ lines: [] });

    expect(container.querySelectorAll("dt")).toHaveLength(1);
    expect(screen.getByText("Total")).toBeVisible();
    expect(screen.getByText("$138.24")).toBeVisible();
  });

  it("renders duplicate labels without dropping a row", () => {
    const { container } = renderSummary({
      lines: [
        { label: "Fee", value: "$1.00" },
        { label: "Fee", value: "$1.00" },
      ],
    });

    expect(container.querySelectorAll("dt")).toHaveLength(3);
  });
});

describe("OrderSummary shell", () => {
  it("names the section after the title", () => {
    renderSummary({ title: "Order summary" });

    const region = screen.getByRole("region", { name: "Order summary" });
    expect(region.tagName).toBe("SECTION");
    expect(
      within(region).getByRole("heading", { name: "Order summary" }),
    ).toBeVisible();
  });

  it("omits the heading and the section name without a title", () => {
    const { container } = renderSummary();

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(container.querySelector("section")).not.toHaveAttribute(
      "aria-labelledby",
    );
  });

  it("defaults to the desktop layout and applies the phone layout", () => {
    const { container, rerender } = renderSummary();
    expect(container.querySelector("section")).toHaveAttribute(
      "data-layout",
      "desktop",
    );

    rerender(<OrderSummary layout="phone" lines={LINES} total={TOTAL} />);
    expect(container.querySelector("section")).toHaveAttribute(
      "data-layout",
      "phone",
    );
  });

  it("passes ref, className and extra props to the root", () => {
    const reference = createRef<HTMLElement>();
    render(
      <OrderSummary
        className="custom-class"
        data-testid="summary"
        lines={LINES}
        ref={reference}
        total={TOTAL}
      />,
    );

    const root = screen.getByTestId("summary");
    expect(root).toHaveClass("custom-class");
    expect(reference.current).toBe(root);
  });
});

describe("OrderSummary promo", () => {
  it("renders no form and no input without promo", () => {
    const { container } = renderSummary();

    expect(container.querySelector("form")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("labels the input and shows default labels", () => {
    renderSummary({ promo: buildPromo() });

    const input = screen.getByLabelText("Promo code");
    expect(input).toBeVisible();
    expect(input).not.toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: "Apply" })).toBeEnabled();
  });

  it("uses custom labels", () => {
    renderSummary({
      promo: buildPromo({
        labels: {
          apply: "Redeem",
          placeholder: "SAVE10",
          title: "Gift card",
        },
      }),
    });

    expect(screen.getByLabelText("Gift card")).toHaveAttribute(
      "placeholder",
      "SAVE10",
    );
    expect(screen.getByRole("button", { name: "Redeem" })).toBeVisible();
  });

  it("falls back to default labels for labels left undefined", () => {
    renderSummary({ promo: buildPromo({ labels: { title: undefined } }) });

    expect(screen.getByLabelText("Promo code")).toBeVisible();
  });

  it("reports typed values through onValueChange", () => {
    const promo = buildPromo({ value: "SAVE" });
    renderSummary({ promo });

    const input = screen.getByLabelText("Promo code");
    expect(input).toHaveValue("SAVE");
    fireEvent.change(input, { target: { value: "SAVE10" } });

    expect(promo.onValueChange).toHaveBeenCalledWith("SAVE10");
  });

  it("calls onApply when the form is submitted", () => {
    const promo = buildPromo({ value: "SAVE10" });
    renderSummary({ promo });

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(promo.onApply).toHaveBeenCalledTimes(1);
  });

  it("links an idle hint to the input without an alert", () => {
    renderSummary({ promo: buildPromo({ hint: "Codes are case sensitive." }) });

    const input = screen.getByLabelText("Promo code");
    expect(input).toHaveAccessibleDescription("Codes are case sensitive.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the error hint as an alert linked to an invalid input", () => {
    renderSummary({
      promo: buildPromo({
        hint: "This code has expired.",
        status: "error",
        value: "OLD10",
      }),
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("This code has expired.");

    const input = screen.getByLabelText("Promo code");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", alert.id);
    expect(input).toHaveAccessibleDescription("This code has expired.");
  });

  it("announces the default error words when error has no hint", () => {
    renderSummary({ promo: buildPromo({ status: "error" }) });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("This code can't be applied");

    const input = screen.getByLabelText("Promo code");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", alert.id);
    expect(input).toHaveAccessibleDescription("This code can't be applied");
  });

  it("announces the default error words when the hint is empty", () => {
    renderSummary({ promo: buildPromo({ hint: "", status: "error" }) });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This code can't be applied",
    );
  });

  it("uses the error label when error has no hint", () => {
    renderSummary({
      promo: buildPromo({
        labels: { error: "Ce code est invalide" },
        status: "error",
      }),
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Ce code est invalide");
  });

  it("lets a given hint win over the error label", () => {
    renderSummary({
      promo: buildPromo({
        hint: "This code has expired.",
        labels: { error: "Ce code est invalide" },
        status: "error",
      }),
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("This code has expired.");
    expect(alert).not.toHaveTextContent("Ce code est invalide");
  });

  it("shows no error words outside the error status", () => {
    renderSummary({
      promo: buildPromo({ labels: { error: "Ce code est invalide" } }),
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("Ce code est invalide")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Promo code")).not.toHaveAttribute(
      "aria-describedby",
    );
  });

  it("disables apply and shows a spinner with the apply word while applying", () => {
    const promo = buildPromo({ status: "applying", value: "SAVE10" });
    renderSummary({ promo });

    const apply = screen.getByRole("button", { name: /apply/i });
    expect(apply).toBeDisabled();
    expect(within(apply).getByText(/loading/i)).toBeInTheDocument();
    expect(apply).toHaveTextContent("Apply");
    expect(screen.getByLabelText("Promo code")).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("does not call onApply while applying", () => {
    const promo = buildPromo({ status: "applying", value: "SAVE10" });
    const { container } = renderSummary({ promo });

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    if (form) {
      fireEvent.submit(form);
    }

    expect(promo.onApply).not.toHaveBeenCalled();
  });

  it("shows no spinner while idle", () => {
    renderSummary({ promo: buildPromo() });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});

describe("OrderSummary checkout", () => {
  it("renders the default label and calls onCheckout on click", () => {
    const onCheckout = vi.fn();
    renderSummary({ onCheckout });

    const checkout = screen.getByRole("button", { name: "Checkout" });
    expect(checkout).not.toHaveAttribute("aria-busy");
    fireEvent.click(checkout);

    expect(onCheckout).toHaveBeenCalledTimes(1);
  });

  it("uses a custom checkout label", () => {
    renderSummary({ checkoutLabel: "Pay now" });

    expect(screen.getByRole("button", { name: "Pay now" })).toBeVisible();
  });

  it("does not throw on click without onCheckout", () => {
    renderSummary();

    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "Checkout" })),
    ).not.toThrow();
  });

  it("is busy, disabled and shows a spinner while loading", () => {
    const onCheckout = vi.fn();
    renderSummary({ checkoutLoading: true, onCheckout });

    const checkout = screen.getByRole("button", { name: /checkout/i });
    expect(checkout).toHaveAttribute("aria-busy", "true");
    expect(checkout).toBeDisabled();
    expect(within(checkout).getByText(/loading/i)).toBeInTheDocument();

    fireEvent.click(checkout);
    expect(onCheckout).not.toHaveBeenCalled();
  });
});
