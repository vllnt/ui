import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NumberInput } from "./number-input";

describe("NumberInput", () => {
  it("renders the default value", () => {
    render(<NumberInput defaultValue={3} />);

    expect(screen.getByRole("spinbutton")).toHaveValue(3);
  });

  it("increments using the plus button", () => {
    const onValueChange = vi.fn();

    render(<NumberInput defaultValue={1} onValueChange={onValueChange} />);

    fireEvent.click(screen.getAllByRole("button")[1]);

    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it("allows clearing the value", () => {
    render(<NumberInput defaultValue={5} />);

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });

    expect(screen.getByRole("spinbutton")).toHaveValue(null);
  });
});
