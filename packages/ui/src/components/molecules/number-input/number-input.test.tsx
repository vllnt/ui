import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NumberInput } from "./number-input";

describe("NumberInput", () => {
  it("renders the default value and increments using the plus button", () => {
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={3} onValueChange={onValueChange} />);
    expect(screen.getByRole("spinbutton")).toHaveValue(3);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onValueChange).toHaveBeenCalledWith(4);
  });

  it("allows clearing the value", () => {
    render(<NumberInput defaultValue={5} />);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });
    expect(screen.getByRole("spinbutton")).toHaveValue(null);
  });

  it("names the step buttons and lets consumers override the labels", () => {
    const { rerender } = render(<NumberInput aria-label="Quantity" />);
    expect(screen.getByRole("button", { name: "Decrease" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase" })).toBeInTheDocument();
    rerender(
      <NumberInput
        aria-label="Quantity"
        decrementLabel="Remove one"
        incrementLabel="Add one"
      />,
    );
    expect(screen.getByRole("button", { name: "Remove one" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add one" })).toBeInTheDocument();
  });
});
