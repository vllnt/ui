import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ViewportBookmark, ViewportBookmarks } from "./viewport-bookmarks";

const sample: ViewportBookmark[] = [
  { color: "#5b8def", id: "home", label: "Home base" },
  { color: "#ef4444", detail: "5 open", id: "incidents", label: "Incidents" },
];

describe("ViewportBookmarks", () => {
  it("renders one row per bookmark", () => {
    const { container } = render(<ViewportBookmarks bookmarks={sample} />);

    expect(container.querySelectorAll("[data-viewport-bookmark]")).toHaveLength(
      2,
    );
  });

  it("renders the empty state when bookmarks list is empty", () => {
    const { container } = render(<ViewportBookmarks bookmarks={[]} />);

    expect(
      container.querySelector("[data-viewport-bookmarks-state='empty']"),
    ).toBeInTheDocument();
  });

  it("invokes onSelect with the activated id", () => {
    const handleSelect = vi.fn();
    render(<ViewportBookmarks bookmarks={sample} onSelect={handleSelect} />);

    fireEvent.click(screen.getByText("Incidents"));
    expect(handleSelect).toHaveBeenCalledWith("incidents");
  });

  it("renders rows as plain spans when onSelect is omitted", () => {
    render(<ViewportBookmarks bookmarks={sample} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("propagates active state to a data attribute", () => {
    const { container } = render(
      <ViewportBookmarks
        activeId="incidents"
        bookmarks={sample}
        onSelect={vi.fn()}
      />,
    );

    expect(
      container.querySelector("[data-viewport-bookmark='incidents']"),
    ).toHaveAttribute("data-viewport-bookmark-active", "true");
  });

  it("renders the optional detail line", () => {
    render(<ViewportBookmarks bookmarks={sample} />);

    expect(screen.getByText("5 open")).toBeInTheDocument();
  });
});
