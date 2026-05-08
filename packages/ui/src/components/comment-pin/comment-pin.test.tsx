import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommentPin } from "./comment-pin";

describe("CommentPin", () => {
  it("positions absolutely from x/y props", () => {
    const { container } = render(<CommentPin x={120} y={80} />);

    const pin = container.querySelector("[data-comment-status]");
    expect(pin).toHaveStyle({ left: "120px", top: "80px" });
  });

  it("emits the configured status via data-comment-status", () => {
    const { container } = render(<CommentPin status="resolved" x={0} y={0} />);

    expect(container.querySelector("[data-comment-status]")).toHaveAttribute(
      "data-comment-status",
      "resolved",
    );
  });

  it("renders the count number inside the pin", () => {
    render(<CommentPin count={3} x={0} y={0} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("prefers initials over count when both are passed", () => {
    render(<CommentPin count={5} initials="SS" x={0} y={0} />);

    expect(screen.getByText("SS")).toBeInTheDocument();
    expect(screen.queryByText("5")).toBeNull();
  });

  it("fires onSelect when the pin is clicked", () => {
    const onSelect = vi.fn();
    render(<CommentPin onSelect={onSelect} x={0} y={0} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
