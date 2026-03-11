import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Menubar } from "./menubar";

describe("Menubar", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<Menubar />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<Menubar className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to DOM element", () => {
      const ref = { current: null };
      render(<Menubar ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<Menubar />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
