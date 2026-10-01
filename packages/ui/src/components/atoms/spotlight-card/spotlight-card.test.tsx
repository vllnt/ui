import { Activity, StrictMode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubAnimationFrame } from "../../../__tests__/stub-animation-frame";

import { SpotlightCard } from "./spotlight-card";

describe("SpotlightCard", () => {
  it("renders its children and applies a custom class name", () => {
    const { container } = render(
      <SpotlightCard className="custom-class">Hover me</SpotlightCard>,
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("tracks the pointer without throwing", () => {
    const { container } = render(<SpotlightCard>Card</SpotlightCard>);
    const card = container.firstChild;
    expect(card).not.toBeNull();
    if (card) {
      fireEvent.pointerMove(card, { clientX: 10, clientY: 20 });
      fireEvent.pointerLeave(card);
    }
    expect(screen.getByText("Card")).toBeInTheDocument();
  });
});

describe("SpotlightCard spotlight", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("paints the spotlight at the pointer once per frame and hides it on leave", () => {
    const frames = stubAnimationFrame();
    const { container } = render(<SpotlightCard>Card</SpotlightCard>);
    const card = container.firstChild;
    if (!(card instanceof HTMLElement)) throw new Error("Expected card");
    const spotlightLayer = card.querySelector("span");
    if (!spotlightLayer) throw new Error("Expected spotlight layer");
    const layout = vi.spyOn(card, "getBoundingClientRect").mockReturnValue({
      bottom: 120,
      height: 100,
      left: 20,
      right: 220,
      toJSON: () => ({}),
      top: 20,
      width: 200,
      x: 20,
      y: 20,
    });
    expect(spotlightLayer.style.opacity).toBe("0");

    fireEvent(
      card,
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 25,
        clientY: 25,
      }),
    );
    fireEvent(
      card,
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 30,
        clientY: 40,
      }),
    );
    expect(frames.pending()).toBe(1);
    frames.flush();

    expect(layout).toHaveBeenCalledTimes(1);
    expect(spotlightLayer.style.opacity).toBe("1");
    expect(spotlightLayer.style.background).toContain("circle at 10px 20px");

    fireEvent.pointerLeave(card);
    expect(spotlightLayer.style.opacity).toBe("0");
    expect(spotlightLayer.style.background).toBe("");
  });
});

function spotlightParts(container: HTMLElement): {
  card: HTMLElement;
  layer: HTMLElement;
} {
  const card = container.firstChild;
  if (!(card instanceof HTMLElement)) throw new Error("Expected card");
  const layer = card.querySelector("span");
  if (!layer) throw new Error("Expected spotlight layer");
  vi.spyOn(card, "getBoundingClientRect").mockReturnValue({
    bottom: 100,
    height: 100,
    left: 0,
    right: 100,
    toJSON: () => ({}),
    top: 0,
    width: 100,
    x: 0,
    y: 0,
  });
  return { card, layer };
}

function hover(card: HTMLElement): void {
  fireEvent(
    card,
    new MouseEvent("pointermove", { bubbles: true, clientX: 30, clientY: 40 }),
  );
}

describe("SpotlightCard lifecycle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps tracking the pointer under StrictMode", () => {
    const frames = stubAnimationFrame();
    const { container } = render(
      <StrictMode>
        <SpotlightCard>Card</SpotlightCard>
      </StrictMode>,
    );
    const { card, layer } = spotlightParts(container);

    hover(card);
    frames.flush();

    expect(layer.style.opacity).toBe("1");
  });

  it("resumes after an Activity hide/show cancels a pending frame", () => {
    const frames = stubAnimationFrame();
    const card = <SpotlightCard>Card</SpotlightCard>;
    const view = render(<Activity mode="visible">{card}</Activity>);
    const parts = spotlightParts(view.container);

    hover(parts.card);
    view.rerender(<Activity mode="hidden">{card}</Activity>);
    view.rerender(<Activity mode="visible">{card}</Activity>);
    expect(frames.pending()).toBe(0);
    hover(parts.card);
    frames.flush();

    expect(parts.layer.style.opacity).toBe("1");
    expect(parts.layer.style.background).toContain("circle at 30px 40px");
  });
});
