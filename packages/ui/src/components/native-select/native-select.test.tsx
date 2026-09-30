import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NativeSelect } from "./native-select";

describe("NativeSelect", () => {
  it("renders a combobox with merged className and calls onChange on pick", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <NativeSelect
        aria-label="Fruit"
        className="custom-class"
        onChange={onChange}
      >
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </NativeSelect>,
    );
    expect(getByRole("combobox")).toHaveClass("custom-class");
    fireEvent.change(getByRole("combobox"), { target: { value: "banana" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("respects the disabled attribute", () => {
    const { getByRole } = render(
      <NativeSelect aria-label="Fruit" disabled>
        <option value="apple">Apple</option>
      </NativeSelect>,
    );
    expect(getByRole("combobox")).toBeDisabled();
  });
});
