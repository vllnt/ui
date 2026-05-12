import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  TutorialFilters,
  type TutorialFiltersLabels,
} from "./tutorial-filters";

const labels: TutorialFiltersLabels = {
  activeFilters: "Active filters:",
  clear: "Clear",
  clearAll: "Clear all",
  difficulty: {
    advanced: "Advanced",
    all: "All",
    beginner: "Beginner",
    intermediate: "Intermediate",
  },
  difficultyLabel: "Difficulty",
  searchFilter: "Search",
  searchLabel: "Search tutorials",
  searchPlaceholder: "Search by topic",
  tagsLabel: "Tags",
};

const baseProps = {
  currentDifficulty: "",
  currentTags: [] as string[],
  labels,
  onFilterChange: vi.fn(),
  searchQuery: "",
  tags: ["React", "Design"],
};

describe("TutorialFilters", () => {
  it("renders search, difficulty options, and tags", () => {
    render(<TutorialFilters {...baseProps} />);

    expect(screen.getByLabelText("Search tutorials")).toHaveAttribute(
      "placeholder",
      "Search by topic",
    );
    expect(screen.getByText("Beginner")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("emits search and difficulty updates", () => {
    const handleFilterChange = vi.fn();
    render(
      <TutorialFilters {...baseProps} onFilterChange={handleFilterChange} />,
    );

    fireEvent.change(screen.getByLabelText("Search tutorials"), {
      target: { value: "state" },
    });
    fireEvent.click(screen.getByText("Intermediate"));

    expect(handleFilterChange).toHaveBeenCalledWith({ search: "state" });
    expect(handleFilterChange).toHaveBeenCalledWith({
      difficulty: "intermediate",
    });
  });

  it("toggles tags from the current selection", () => {
    const handleFilterChange = vi.fn();
    render(
      <TutorialFilters
        {...baseProps}
        currentTags={["React"]}
        onFilterChange={handleFilterChange}
      />,
    );
    const [reactTag] = screen.getAllByText("React");
    if (!reactTag) throw new Error("Expected React tag to render");

    fireEvent.click(reactTag);
    fireEvent.click(screen.getByText("Design"));

    expect(handleFilterChange).toHaveBeenCalledWith({ tags: [] });
    expect(handleFilterChange).toHaveBeenCalledWith({
      tags: ["React", "Design"],
    });
  });

  it("renders active filters and clears them", () => {
    const handleFilterChange = vi.fn();
    render(
      <TutorialFilters
        {...baseProps}
        currentDifficulty="advanced"
        currentTags={["React"]}
        onFilterChange={handleFilterChange}
        searchQuery="routing"
      />,
    );

    expect(screen.getByText("Active filters:")).toBeInTheDocument();
    expect(screen.getByText('Search "routing"')).toBeInTheDocument();

    fireEvent.click(screen.getByText("Clear"));
    fireEvent.click(screen.getByText("Clear all"));

    expect(handleFilterChange).toHaveBeenCalledWith({ tags: [] });
    expect(handleFilterChange).toHaveBeenCalledWith({
      difficulty: "all",
      search: "",
      tags: [],
    });
  });

  it("disables search and difficulty controls while pending", () => {
    render(<TutorialFilters {...baseProps} isPending />);

    expect(screen.getByLabelText("Search tutorials")).toBeDisabled();
    expect(screen.getByText("Beginner").closest("button")).toBeDisabled();
  });
});
