import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Switch } from "./switch";

describe("Switch", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      render(<Switch />);

      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<Switch className="custom-class" />);

      expect(screen.getByRole("switch")).toHaveClass("custom-class");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to DOM element", () => {
      const ref = { current: null };
      render(<Switch ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
  describe("accessibility", () => {
    it("has accessible switch role", () => {
      render(<Switch />);

      expect(screen.getByRole("switch")).toBeVisible();
    });
  });
});
