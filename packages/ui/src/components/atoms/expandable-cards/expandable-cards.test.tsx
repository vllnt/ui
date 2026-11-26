import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

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

it("ExpandableCards keeps one card open, hides the others, and reports each change", () => {
  const onExpandedIdChange = vi.fn();
  render(
    <ExpandableCards
      cards={cards}
      defaultExpandedId="one"
      onExpandedIdChange={onExpandedIdChange}
    />,
  );
  expect(screen.getByText("Hidden body")).toBeVisible();
  expect(screen.getByText("Second body")).not.toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: /Second card/ }));
  expect(onExpandedIdChange).toHaveBeenLastCalledWith("two");
  expect(screen.getByText("Hidden body")).not.toBeVisible();
  expect(screen.getByText("Second body")).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: /Second card/ }));
  expect(onExpandedIdChange).toHaveBeenLastCalledWith(null);
  expect(screen.getByText("Second body")).not.toBeVisible();
});

it("ExpandableCards follows expandedId when controlled", () => {
  const onExpandedIdChange = vi.fn();
  const { rerender } = render(
    <ExpandableCards
      cards={cards}
      expandedId={null}
      onExpandedIdChange={onExpandedIdChange}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /First card/ }));
  expect(onExpandedIdChange).toHaveBeenCalledWith("one");
  expect(screen.getByText("Hidden body")).not.toBeVisible();

  rerender(
    <ExpandableCards
      cards={cards}
      expandedId="one"
      onExpandedIdChange={onExpandedIdChange}
    />,
  );
  expect(screen.getByText("Hidden body")).toBeVisible();
});
