import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./alert";

describe("Alert", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<Alert />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<Alert className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("variant variants", () => {
    it.each(["default", "destructive"] as const)(
      "renders %s variant",
      (variant) => {
        const { container } = render(<Alert variant={variant} />);

        expect(container.firstChild).toBeInTheDocument();
      },
    );
  });

  describe("ref forwarding", () => {
    it("forwards ref to DOM element", () => {
      const ref = { current: null };
      render(<Alert ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<Alert />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
