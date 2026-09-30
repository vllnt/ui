import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterBar, type FilterBarProps } from "./filter-bar";

const defaultProps: FilterBarProps = {
  currentDifficulty: "",
  currentTags: [],
  difficultyOptions: [
    { label: "All", value: "all" },
    { label: "Beginner", value: "beginner" },
    { label: "Advanced", value: "advanced" },
  ],
  onFiltersChange: vi.fn(),
  searchQuery: "",
  tags: ["React", "TypeScript"],
};

function renderFilterBar(props: Partial<FilterBarProps> = {}) {
  const onFiltersChange = vi.fn();
  const view = render(
    <FilterBar
      {...defaultProps}
      {...props}
      onFiltersChange={onFiltersChange}
    />,
  );
  return { onFiltersChange, ...view };
}

describe("FilterBar", () => {
  it("renders filters and emits search, difficulty, and tag-on changes", () => {
    const { onFiltersChange } = renderFilterBar();
    expect(screen.getByText("Difficulty:")).toBeInTheDocument();
    expect(screen.getByText("Tags:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "forms" },
    });
    expect(onFiltersChange).toHaveBeenCalledWith({ search: "forms" });
    fireEvent.click(screen.getByRole("button", { name: "Advanced" }));
    expect(onFiltersChange).toHaveBeenCalledWith({ difficulty: "advanced" });
    fireEvent.click(screen.getByText("React"));
    expect(onFiltersChange).toHaveBeenCalledWith({ tags: ["React"] });
  });

  it.each([
    [
      "toggles a selected tag off",
      () => fireEvent.click(screen.getAllByText("React")[0]),
    ],
    [
      "clears selected tags",
      () => fireEvent.click(screen.getByRole("button", { name: "Clear" })),
    ],
  ])("%s", (_name, act) => {
    const { onFiltersChange } = renderFilterBar({ currentTags: ["React"] });
    act();
    expect(onFiltersChange).toHaveBeenCalledWith({ tags: [] });
  });

  it("summarizes active filters and clears all values", () => {
    const { onFiltersChange } = renderFilterBar({
      currentDifficulty: "advanced",
      currentTags: ["React"],
      searchQuery: "buttons",
    });
    const input = screen.getByLabelText("Search");
    expect(screen.getByText("Active filters:")).toBeInTheDocument();
    expect(screen.getByText('Search "buttons"')).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onFiltersChange).toHaveBeenCalledWith({
      difficulty: "all",
      search: "",
      tags: [],
    });
    expect(input).toHaveValue("");
  });
});
