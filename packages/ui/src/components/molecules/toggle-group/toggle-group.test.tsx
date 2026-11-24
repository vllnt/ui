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

describe("ToggleGroup Radix-compatible modes", () => {
  it("reads as a radio group with string values in single mode", () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup
        aria-label="Align"
        defaultValue="a"
        onValueChange={handleChange}
        type="single"
      >
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Align" })).toBeVisible();
    const a = screen.getByRole("radio", { name: "A" });
    const b = screen.getByRole("radio", { name: "B" });
    expect(a).toHaveAttribute("aria-checked", "true");
    expect(a).not.toHaveAttribute("aria-pressed");
    fireEvent.click(b);
    expect(handleChange).toHaveBeenLastCalledWith("b");
    expect(b).toHaveAttribute("data-state", "on");
    expect(a).toHaveAttribute("data-state", "off");
  });

  it("clears a single group with an empty string when the pressed item is pressed again", () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup defaultValue="a" onValueChange={handleChange} type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "A" }));
    expect(handleChange).toHaveBeenLastCalledWith("");
    expect(screen.getByRole("radio", { name: "A" })).toHaveAttribute(
      "data-state",
      "off",
    );
  });

  it("reads as a toolbar with list values in multiple mode", () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup
        aria-label="Format"
        onValueChange={handleChange}
        type="multiple"
      >
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole("toolbar", { name: "Format" })).toBeVisible();
    const bold = screen.getByRole("button", { name: "Bold" });
    fireEvent.click(bold);
    fireEvent.click(screen.getByRole("button", { name: "Italic" }));
    // ui-sdk adds a details argument after the list.
    expect(handleChange).toHaveBeenNthCalledWith(
      1,
      ["bold"],
      expect.anything(),
    );
    expect(handleChange).toHaveBeenNthCalledWith(
      2,
      ["bold", "italic"],
      expect.anything(),
    );
    expect(bold).toHaveAttribute("data-state", "on");
    expect(bold).toHaveAttribute("aria-pressed", "true");
  });
});
