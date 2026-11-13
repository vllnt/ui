import * as React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TagsInput } from "./tags-input";

describe("TagsInput", () => {
  it("supports uncontrolled keyboard add and remove flows", () => {
    render(<TagsInput aria-label="Framework tags" defaultValue={["React"]} />);
    const input = screen.getByRole("textbox", { name: "Framework tags" });
    fireEvent.change(input, { target: { value: "Vue" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(screen.queryByText("Vue")).not.toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("supports controlled value updates through onValueChange", () => {
    function ControlledTagsInput() {
      const [value, setValue] = React.useState(["React"]);
      return (
        <TagsInput
          aria-label="Controlled tags"
          onValueChange={setValue}
          value={value}
        />
      );
    }
    render(<ControlledTagsInput />);
    const input = screen.getByRole("textbox", { name: "Controlled tags" });
    fireEvent.change(input, { target: { value: "Vue" } });
    fireEvent.keyDown(input, { key: "," });
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
  });

  it("prevents editing and removal when disabled", () => {
    const handleValueChange = vi.fn();
    render(
      <TagsInput
        aria-label="Disabled tags"
        defaultValue={["React"]}
        disabled
        onValueChange={handleValueChange}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Disabled tags" });
    const removeButton = screen.getByRole("button", { name: "Remove React" });
    expect(input).toBeDisabled();
    expect(removeButton).toBeDisabled();
    expect(screen.getByRole("group")).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(removeButton);
    expect(handleValueChange).not.toHaveBeenCalled();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders tags as bordered list items with accessible remove buttons", () => {
    render(
      <TagsInput aria-label="A11y tags" defaultValue={["React", "Vue"]} />,
    );
    const list = screen.getByRole("list");
    const items = screen.getAllByRole("listitem");
    expect(list).toBeInTheDocument();
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveClass("rounded-md", "border", "bg-muted");
    expect(items[0]).not.toHaveClass("rounded-full");
    expect(
      screen.getByRole("button", { name: "Remove React" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Vue" }),
    ).toBeInTheDocument();
  });

  it("gives each remove button the Remove <tag> name and a 24 px hit area", () => {
    render(
      <TagsInput aria-label="Target tags" defaultValue={["React", "Vue"]} />,
    );
    const buttons = screen.getAllByRole("button");
    const [react, vue] = buttons;

    expect(buttons).toHaveLength(2);
    expect(react).toHaveAccessibleName("Remove React");
    expect(vue).toHaveAccessibleName("Remove Vue");
    expect([react?.tagName, vue?.tagName]).toEqual(["BUTTON", "BUTTON"]);
    expect(react).toHaveAttribute("type", "button");
    expect(vue).toHaveAttribute("type", "button");
    expect(react).toHaveClass(
      "size-6",
      "focus-visible:ring-2",
      "focus-visible:ring-inset",
    );
    expect(vue).toHaveClass(
      "size-6",
      "focus-visible:ring-2",
      "focus-visible:ring-inset",
    );
  });

  it("removes the tag when its remove button is clicked", () => {
    const handleValueChange = vi.fn();
    render(
      <TagsInput
        aria-label="Click tags"
        defaultValue={["React", "Vue"]}
        onValueChange={handleValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove React" }));

    expect(handleValueChange).toHaveBeenCalledWith(["Vue"]);
    expect(screen.queryByText("React")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove React" }),
    ).not.toBeInTheDocument();
  });

  it("renders no remove button for an empty list", () => {
    render(<TagsInput aria-label="Empty tags" />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("renders one remove button for blank and duplicate defaults", () => {
    render(
      <TagsInput
        aria-label="Clean tags"
        defaultValue={["React", " React ", "  "]}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Remove React" }),
    ).toBeInTheDocument();
  });
});
