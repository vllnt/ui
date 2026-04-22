import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NavigationMenu } from "./navigation-menu";

describe("NavigationMenu", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<NavigationMenu />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<NavigationMenu className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to DOM element", () => {
      const ref = { current: null };
      render(<NavigationMenu ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<NavigationMenu />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
