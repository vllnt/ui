import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InfinitePlane } from "./infinite-plane";

describe("InfinitePlane", () => {
  describe("rendering", () => {
    it("renders the content wrapper with the initial view", () => {
      const { container } = render(
        <InfinitePlane initialView={{ x: 50, y: 30, zoom: 1.5 }}>
          <p>Object</p>
        </InfinitePlane>,
      );

      const stage = container.querySelector("[data-zoom]");
      expect(stage).toHaveAttribute("data-zoom", "1.5");
      expect(stage).toHaveAttribute("data-pan-x", "50");
      expect(stage).toHaveAttribute("data-pan-y", "30");
    });

    it("hides the grid backdrop when withoutGrid is set", () => {
      const { container } = render(
        <InfinitePlane withoutGrid>
          <p>Object</p>
        </InfinitePlane>,
      );

      expect(container.querySelector("[aria-hidden='true']")).toBeNull();
    });
  });

  describe("interaction", () => {
    it("renders the transformed content wrapper with pan + zoom transform", () => {
      const { container } = render(
        <InfinitePlane initialView={{ x: 30, y: 10, zoom: 1.25 }}>
          <p>Object</p>
        </InfinitePlane>,
      );

      const content = container.querySelector<HTMLDivElement>(
        "[data-infinite-plane-content]",
      );
      expect(content).not.toBeNull();
      expect(content?.style.transform).toContain("translate(30px, 10px)");
      expect(content?.style.transform).toContain("scale(1.25)");
    });
  });
});
