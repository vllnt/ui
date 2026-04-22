import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Rating } from "./rating";

describe("Rating", () => {
  it("updates the selected value", () => {
    render(<Rating label="Lesson difficulty" showValue />);

    fireEvent.click(screen.getByLabelText("4 stars"));

    expect(screen.getByText("4/5")).toBeInTheDocument();
  });

  it("allows clearing the value when configured", () => {
    const onValueChange = vi.fn();

    render(
      <Rating
        allowClear
        label="Confidence"
        onValueChange={onValueChange}
        value={3}
      />,
    );

    fireEvent.click(screen.getByLabelText("3 stars"));

    expect(onValueChange).toHaveBeenCalledWith(0);
  });
});
