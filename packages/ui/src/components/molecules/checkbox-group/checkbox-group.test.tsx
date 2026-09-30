import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CheckboxGroup, CheckboxGroupItem } from "./checkbox-group";

describe("CheckboxGroup", () => {
  it("renders its items inside a group and reflects the default value", () => {
    const { getByLabelText, getByRole } = render(
      <CheckboxGroup defaultValue={["a"]}>
        <CheckboxGroupItem value="a">Option A</CheckboxGroupItem>
        <CheckboxGroupItem value="b">Option B</CheckboxGroupItem>
      </CheckboxGroup>,
    );
    expect(getByRole("group")).toBeInTheDocument();
    expect(getByLabelText("Option A")).toBeChecked();
    expect(getByLabelText("Option B")).not.toBeChecked();
  });

  it("calls onValueChange when an item is toggled", () => {
    const onValueChange = vi.fn();
    const { getByLabelText } = render(
      <CheckboxGroup onValueChange={onValueChange}>
        <CheckboxGroupItem value="a">Option A</CheckboxGroupItem>
      </CheckboxGroup>,
    );
    fireEvent.click(getByLabelText("Option A"));
    expect(onValueChange).toHaveBeenCalledWith(["a"]);
  });

  it("throws when an item renders without a group", () => {
    expect(() =>
      render(<CheckboxGroupItem value="a">A</CheckboxGroupItem>),
    ).toThrow();
  });
});
