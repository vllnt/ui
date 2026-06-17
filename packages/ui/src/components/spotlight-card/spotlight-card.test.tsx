import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SpotlightCard } from "./spotlight-card";

describe("SpotlightCard", () => {
  it("renders its children", () => {
    render(<SpotlightCard>Hover me</SpotlightCard>);

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <SpotlightCard className="custom-class">Card</SpotlightCard>,
    );

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
