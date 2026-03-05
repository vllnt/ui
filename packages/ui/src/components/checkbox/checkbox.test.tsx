import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      render(<Checkbox />);

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<Checkbox className="custom-class" />);

      expect(screen.getByRole("checkbox")).toHaveClass("custom-class");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to DOM element", () => {
      const ref = { current: null };
      render(<Checkbox ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
  describe("accessibility", () => {
    it("has accessible checkbox role", () => {
      render(<Checkbox />);

      expect(screen.getByRole("checkbox")).toBeVisible();
    });
  });
});
