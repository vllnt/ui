import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("keeps the destructive title and body in the foreground, with status colour only on the glyph and border", () => {
    const { container, getByText } = render(
      <Alert variant="destructive">
        <svg aria-hidden="true" />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Check the card number.</AlertDescription>
      </Alert>,
    );
    const root = container.firstElementChild;
    expect(root).toHaveClass("text-foreground");
    expect(root).not.toHaveClass("text-destructive");
    expect(root).toHaveClass("border-destructive/50");
    expect(root).toHaveClass("[&>svg]:text-destructive");
    expect(getByText("Payment failed").className).not.toContain("destructive");
    expect(getByText("Check the card number.").className).not.toContain(
      "destructive",
    );
  });

  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(<Alert className="custom-class" ref={ref} />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it.each(["default", "destructive"] as const)(
    "renders %s variant",
    (variant) => {
      const { container } = render(<Alert variant={variant} />);
      expect(container.firstChild).toBeInTheDocument();
    },
  );
});
