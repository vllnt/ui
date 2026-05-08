import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ViewportBookmark, ViewportBookmarks } from "./viewport-bookmarks";

const BOOKMARKS: ViewportBookmark[] = [
  { id: "overview", label: "Overview" },
  { id: "release", label: "Release", meta: "Today" },
  { id: "incidents", label: "Incidents" },
];

describe("ViewportBookmarks", () => {
  describe("rendering", () => {
    it("renders one chip per bookmark", () => {
      render(<ViewportBookmarks bookmarks={BOOKMARKS} />);

      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Release")).toBeInTheDocument();
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("Incidents")).toBeInTheDocument();
    });

    it("renders the empty-state copy when bookmarks is empty", () => {
      render(<ViewportBookmarks bookmarks={[]} />);

      expect(screen.getByText("No saved viewports")).toBeInTheDocument();
    });

    it("marks the active bookmark with data-active and aria-pressed", () => {
      const { container } = render(
        <ViewportBookmarks activeId="release" bookmarks={BOOKMARKS} />,
      );

      const release = container.querySelector("[data-bookmark-id='release']");
      expect(release).toHaveAttribute("data-active", "true");
      expect(release).toHaveAttribute("aria-pressed", "true");

      const overview = container.querySelector("[data-bookmark-id='overview']");
      expect(overview).not.toHaveAttribute("data-active");
      expect(overview).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("interaction", () => {
    it("fires onSelect with the picked bookmark", () => {
      const onSelect = vi.fn();
      render(<ViewportBookmarks bookmarks={BOOKMARKS} onSelect={onSelect} />);

      fireEvent.click(screen.getByText("Release"));
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: "release" }),
      );
    });
  });
});
