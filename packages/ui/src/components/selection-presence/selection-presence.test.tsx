import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SelectionPresence } from "./selection-presence";

describe("SelectionPresence", () => {
  it("emits the configured color via data-selection-color", () => {
    const { container } = render(
      <SelectionPresence color="emerald">
        <p>Selected card</p>
      </SelectionPresence>,
    );

    expect(container.querySelector("[data-selection-color]")).toHaveAttribute(
      "data-selection-color",
      "emerald",
    );
  });

  it("renders the name chip when name is set", () => {
    render(
      <SelectionPresence name="Sam">
        <p>Body</p>
      </SelectionPresence>,
    );

    expect(screen.getByText("Sam")).toBeInTheDocument();
  });

  it("omits the name chip when name is not set", () => {
    const { container } = render(
      <SelectionPresence>
        <p>Body</p>
      </SelectionPresence>,
    );

    expect(container.querySelector("[data-selection-chip]")).toBeNull();
  });

  it("renders children inside the wrapper", () => {
    render(
      <SelectionPresence color="rose" name="Sam">
        <p>Inner content</p>
      </SelectionPresence>,
    );

    expect(screen.getByText("Inner content")).toBeInTheDocument();
  });
});
