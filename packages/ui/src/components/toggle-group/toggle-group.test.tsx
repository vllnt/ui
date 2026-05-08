import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

describe("ToggleGroup", () => {
  it("renders children items", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("invokes onValueChange when an item is clicked (single)", () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup onValueChange={onValueChange} type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );

    fireEvent.click(screen.getByText("B"));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("respects the value prop (controlled)", () => {
    render(
      <ToggleGroup type="single" value="a">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(screen.getByText("A")).toHaveAttribute("data-state", "on");
    expect(screen.getByText("B")).toHaveAttribute("data-state", "off");
  });

  it("merges the className prop on the root", () => {
    const { container } = render(
      <ToggleGroup className="extra" type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(container.firstChild).toHaveClass("extra");
  });
});
