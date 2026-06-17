import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QrCode } from "./qr-code";

describe("QrCode", () => {
  describe("rendering", () => {
    it("renders an accessible svg with encoded modules", () => {
      const { container } = render(<QrCode value="https://vllnt.com" />);

      const svg = screen.getByRole("img", { name: "QR code" });
      expect(svg.tagName.toLowerCase()).toBe("svg");

      const path = container.querySelector("path");
      expect(path?.getAttribute("d")).toBeTruthy();
    });

    it("uses a custom accessible title", () => {
      render(<QrCode title="Scan to pay" value="pay" />);

      expect(
        screen.getByRole("img", { name: "Scan to pay" }),
      ).toBeInTheDocument();
    });

    it("encodes different values into different module paths", () => {
      const { container: first } = render(<QrCode value="alpha" />);
      const { container: second } = render(<QrCode value="bravo" />);

      const firstPath = first.querySelector("path")?.getAttribute("d");
      const secondPath = second.querySelector("path")?.getAttribute("d");
      expect(firstPath).not.toBe(secondPath);
    });

    it("uses a larger module grid for longer payloads", () => {
      const { container: short } = render(<QrCode value="hi" />);
      const { container: long } = render(<QrCode value={"x".repeat(120)} />);

      const shortDimension = Number(
        short.querySelector("svg")?.getAttribute("viewBox")?.split(" ")[2],
      );
      const longDimension = Number(
        long.querySelector("svg")?.getAttribute("viewBox")?.split(" ")[2],
      );
      expect(longDimension).toBeGreaterThan(shortDimension);
    });

    it("renders an empty path for an empty value without throwing", () => {
      const { container } = render(<QrCode value="" />);

      expect(container.querySelector("path")?.getAttribute("d")).toBe("");
    });

    it("applies custom className", () => {
      render(<QrCode className="custom-class" value="x" />);

      expect(screen.getByRole("img")).toHaveClass("custom-class");
    });
  });
});
