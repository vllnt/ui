import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScrollArea } from "./scroll-area";

describe("ScrollArea", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<ScrollArea />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<ScrollArea className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to DOM element", () => {
      const ref = { current: null };
      render(<ScrollArea ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<ScrollArea />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
