import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterBar, type FilterBarProps } from "./filter-bar";

const difficultyOptions = [
  { label: "All", value: "all" },
  { label: "Beginner", value: "beginner" },
  { label: "Advanced", value: "advanced" },
];

const defaultProps: FilterBarProps = {
  currentDifficulty: "",
  currentTags: [],
  difficultyOptions,
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
  it("renders search, difficulty, and tag filters", () => {
    renderFilterBar();

    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.getByText("Difficulty:")).toBeInTheDocument();
    expect(screen.getByText("Tags:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("emits search filter changes", () => {
    const { onFiltersChange } = renderFilterBar();

    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "forms" },
    });

    expect(onFiltersChange).toHaveBeenCalledWith({ search: "forms" });
  });

  it("emits difficulty changes", () => {
    const { onFiltersChange } = renderFilterBar();

    fireEvent.click(screen.getByRole("button", { name: "Advanced" }));

    expect(onFiltersChange).toHaveBeenCalledWith({ difficulty: "advanced" });
  });

  it("toggles tags on and off", () => {
    const { onFiltersChange, unmount } = renderFilterBar();

    fireEvent.click(screen.getByText("React"));

    expect(onFiltersChange).toHaveBeenCalledWith({ tags: ["React"] });
    unmount();

    const selected = renderFilterBar({ currentTags: ["React"] });
    fireEvent.click(screen.getAllByText("React")[0]);

    expect(selected.onFiltersChange).toHaveBeenCalledWith({ tags: [] });
  });

  it("clears selected tags", () => {
    const { onFiltersChange } = renderFilterBar({ currentTags: ["React"] });

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

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
