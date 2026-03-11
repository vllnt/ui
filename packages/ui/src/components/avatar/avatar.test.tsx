import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./avatar";

describe("Avatar", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<Avatar />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<Avatar className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to DOM element", () => {
      const ref = { current: null };
      render(<Avatar ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<Avatar />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
