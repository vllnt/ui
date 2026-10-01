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

  it("exposes a single tab stop on the checked star (APG radio group)", () => {
    render(<Rating defaultValue={3} label="Quality" />);
    const stops = screen
      .getAllByRole("radio")
      .filter((radio) => radio.getAttribute("tabindex") === "0");
    expect(stops).toEqual([screen.getByLabelText("3 stars")]);
  });

  it("makes the first star the tab stop when nothing is rated", () => {
    render(<Rating label="Quality" />);
    expect(screen.getByLabelText("1 star")).toHaveAttribute("tabindex", "0");
    expect(screen.getByLabelText("2 stars")).toHaveAttribute("tabindex", "-1");
  });

  it("arrow keys change the value and move focus, Home / End jump", () => {
    render(<Rating defaultValue={3} label="Quality" showValue />);
    const three = screen.getByLabelText("3 stars");
    three.focus();
    fireEvent.keyDown(three, { key: "ArrowRight" });
    expect(screen.getByLabelText("4 stars")).toHaveFocus();
    expect(screen.getByText("4/5")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText("4 stars"), { key: "ArrowDown" });
    expect(screen.getByText("5/5")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText("5 stars"), { key: "Home" });
    expect(screen.getByLabelText("1 star")).toHaveFocus();
    expect(screen.getByText("1/5")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText("1 star"), { key: "ArrowLeft" });
    expect(screen.getByText("5/5")).toBeInTheDocument();
  });

  it("arrow keys never clear the value when allowClear is set", () => {
    const onValueChange = vi.fn();
    render(
      <Rating
        allowClear
        defaultValue={2}
        label="Quality"
        onValueChange={onValueChange}
      />,
    );
    const two = screen.getByLabelText("2 stars");
    two.focus();
    fireEvent.keyDown(two, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });
});
