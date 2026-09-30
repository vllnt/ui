import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Marquee } from "./marquee";

describe("Marquee", () => {
  it("renders its content plus a hidden duplicate track and merges className", () => {
    const { container } = render(
      <Marquee className="custom-class">
        <span>One</span>
        <span>Two</span>
      </Marquee>,
    );
    expect(screen.getAllByText("One")).toHaveLength(2);
    expect(screen.getAllByText("Two")).toHaveLength(2);
    const hiddenTracks = screen
      .getAllByText("One")
      .filter(
        (element) =>
          element.parentElement?.parentElement?.getAttribute("aria-hidden") ===
          "true",
      );
    expect(hiddenTracks).toHaveLength(1);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("supports speed presets", () => {
    const { container } = render(
      <Marquee speed="fast">
        <span>Fast</span>
      </Marquee>,
    );
    expect(container.querySelector("[style*='10s']")).toBeTruthy();
  });
});
