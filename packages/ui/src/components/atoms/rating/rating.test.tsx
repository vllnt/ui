import { createRef } from "react";

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

  it("uses a filled-star color with at least 3:1 contrast on light and dark", () => {
    render(<Rating label="Quality" value={2} />);

    // amber-600 on white is 3.2:1; amber-500 on the dark background is above 8:1.
    // The color sits on the star's wrapper, which holds the icon and its radio.
    const filled = screen.getByLabelText("2 stars").parentElement;
    expect(filled).toHaveClass("text-amber-600", "dark:text-amber-500");
    expect(screen.getByLabelText("3 stars").parentElement).not.toHaveClass(
      "text-amber-600",
    );
  });

  it("fills every star up to the value and none above it", () => {
    render(<Rating label="Quality" value={3} />);
    const filled = screen
      .getAllByRole("radio")
      .map((radio) => radio.parentElement?.querySelector("svg"));
    expect(
      filled.map((icon) => icon?.classList.contains("fill-current")),
    ).toEqual([true, true, true, false, false]);
  });

  it("clears with a click on the rated star only when allowClear is set", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Rating label="Quality" onValueChange={onValueChange} value={3} />,
    );
    fireEvent.click(screen.getByLabelText("3 stars"));
    expect(onValueChange).not.toHaveBeenCalledWith(0);
    rerender(
      <Rating
        allowClear
        label="Quality"
        onValueChange={onValueChange}
        value={3}
      />,
    );
    fireEvent.click(screen.getByLabelText("3 stars"));
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it("takes no input when readOnly, and keeps the radio roles and labels", () => {
    const onValueChange = vi.fn();
    render(
      <Rating
        label="Quality"
        onValueChange={onValueChange}
        readOnly
        value={2}
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    fireEvent.click(screen.getByLabelText("4 stars"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("2 stars")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("wraps from the last star to the first with ArrowRight", () => {
    render(<Rating defaultValue={5} label="Quality" showValue />);
    const five = screen.getByLabelText("5 stars");
    five.focus();
    fireEvent.keyDown(five, { key: "ArrowRight" });
    expect(screen.getByLabelText("1 star")).toHaveFocus();
    expect(screen.getByText("1/5")).toBeInTheDocument();
  });
});

describe("Rating extension props", () => {
  it("forwards ref and rest props to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Rating data-testid="rating" label="Quality" ref={ref} />);
    expect(ref.current).toBe(screen.getByTestId("rating"));
    expect(Rating.displayName).toBe("Rating");
  });

  it("reports a change once and not a repeated value", () => {
    const onValueChange = vi.fn();
    render(<Rating defaultValue={2} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByLabelText("4 stars"));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(4);
  });
});
