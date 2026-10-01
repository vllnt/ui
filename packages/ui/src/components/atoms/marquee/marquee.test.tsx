import { fireEvent, render, screen } from "@testing-library/react";
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

  it("keeps the animation name out of inline styles so motion-reduce:animate-none can stop it", () => {
    const { container } = render(
      <Marquee>
        <span>One</span>
      </Marquee>,
    );
    const track = container.querySelector<HTMLElement>("[data-marquee-track]");
    expect(track?.getAttribute("style") ?? "").not.toMatch(
      /animation(-name)?:/,
    );
    expect(track).toHaveClass("motion-reduce:animate-none");
    expect(track).toHaveClass("focus-within:[animation-play-state:paused]");
  });

  it("offers a keyboard-operable pause control that stops the scroll (WCAG 2.2.2)", () => {
    const { container } = render(
      <Marquee>
        <span>One</span>
      </Marquee>,
    );
    const track = container.querySelector<HTMLElement>("[data-marquee-track]");
    const pause = screen.getByRole("button", { name: "Pause" });
    expect(track).not.toHaveClass("[animation-play-state:paused]");
    fireEvent.click(pause);
    expect(track).toHaveClass("[animation-play-state:paused]");
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(track).not.toHaveClass("[animation-play-state:paused]");
  });

  it("localizes the pause control and lets hosts opt out of it", () => {
    const { rerender } = render(
      <Marquee labels={{ pause: "Pausar", play: "Reproducir" }}>
        <span>One</span>
      </Marquee>,
    );
    expect(screen.getByRole("button", { name: "Pausar" })).toBeInTheDocument();
    rerender(
      <Marquee pauseControl={false}>
        <span>One</span>
      </Marquee>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});
