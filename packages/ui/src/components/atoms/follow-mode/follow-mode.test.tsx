import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FollowMode } from "./follow-mode";

describe("FollowMode", () => {
  it("renders children, the participant chip, the color attribute, and no stop button without onStop", () => {
    const { container } = render(
      <FollowMode color="emerald" name="Sam">
        <p>Inner content</p>
      </FollowMode>,
    );
    expect(container.querySelector("[data-follow-color]")).toHaveAttribute(
      "data-follow-color",
      "emerald",
    );
    expect(screen.getByText(/Following Sam/)).toBeInTheDocument();
    expect(screen.getByText("Inner content")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Stop" })).toBeNull();
  });

  it("renders a stop button that fires onStop when set", () => {
    const onStop = vi.fn();
    render(
      <FollowMode name="Sam" onStop={onStop}>
        <p>Body</p>
      </FollowMode>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
