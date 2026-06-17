import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ExpandableCardItem, ExpandableCards } from "./expandable-cards";

const cards: ExpandableCardItem[] = [
  {
    content: <p>Hidden body</p>,
    description: "Subtitle",
    id: "one",
    title: "First card",
  },
  { content: <p>Second body</p>, id: "two", title: "Second card" },
];

describe("ExpandableCards", () => {
  it("renders card titles", () => {
    render(<ExpandableCards cards={cards} />);

    expect(screen.getByText("First card")).toBeInTheDocument();
    expect(screen.getByText("Second card")).toBeInTheDocument();
  });

  it("toggles aria-expanded when a header is clicked", () => {
    render(<ExpandableCards cards={cards} />);

    const trigger = screen.getByText("First card").closest("button");
    expect(trigger).not.toBeNull();
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    if (trigger !== null) {
      fireEvent.click(trigger);
    }

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <ExpandableCards cards={cards} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
