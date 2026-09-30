import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

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

it("ExpandableCards renders titles, applies className, and toggles aria-expanded", () => {
  const { container } = render(
    <ExpandableCards cards={cards} className="custom-class" />,
  );
  expect(container.firstChild).toHaveClass("custom-class");
  expect(screen.getByText("Second card")).toBeInTheDocument();
  const trigger = screen.getByText("First card").closest("button");
  expect(trigger).not.toBeNull();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  if (trigger !== null) {
    fireEvent.click(trigger);
  }
  expect(trigger).toHaveAttribute("aria-expanded", "true");
});
