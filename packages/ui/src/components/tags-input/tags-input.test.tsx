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

  it("renders tags as a list with accessible remove buttons", () => {
    render(
      <TagsInput aria-label="A11y tags" defaultValue={["React", "Vue"]} />,
    );

    const list = screen.getByRole("list");
    const items = screen.getAllByRole("listitem");

    expect(list).toBeInTheDocument();
    expect(items).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Remove React" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Vue" }),
    ).toBeInTheDocument();
  });
});
