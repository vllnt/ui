import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PresenceStack, type PresenceUser } from "./presence-stack";

const sample: PresenceUser[] = [
  { color: "#5b8def", id: "1", initial: "B", name: "Bea" },
  { color: "#10b981", id: "2", initial: "L", name: "Lior", status: "away" },
  { color: "#f59e0b", id: "3", initial: "S", name: "Sam", status: "idle" },
];

describe("PresenceStack", () => {
  it("renders one avatar per visible user", () => {
    const { container } = render(<PresenceStack users={sample} />);

    expect(
      container.querySelectorAll("[data-presence-stack-user]"),
    ).toHaveLength(3);
  });

  it("propagates the user accent color to the avatar background", () => {
    const { container } = render(<PresenceStack users={sample} />);

    expect(
      container.querySelector("[data-presence-stack-user='1']"),
    ).toHaveStyle({ "background-color": "#5b8def" });
  });

  it("propagates status to a data attribute", () => {
    const { container } = render(<PresenceStack users={sample} />);

    expect(
      container.querySelector("[data-presence-stack-user='2']"),
    ).toHaveAttribute("data-presence-stack-status", "away");
  });

  it("renders the overflow chip when users exceed max", () => {
    render(<PresenceStack max={2} users={sample} />);

    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByLabelText("1 more")).toBeInTheDocument();
  });

  it("renders the overflow as a button when onOverflowActivate is provided", () => {
    const handleClick = vi.fn();
    render(
      <PresenceStack max={2} onOverflowActivate={handleClick} users={sample} />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders the overflow as a plain span when no handler is provided", () => {
    render(<PresenceStack max={2} users={sample} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("uses the user name as a hover title", () => {
    const { container } = render(<PresenceStack users={sample} />);

    expect(
      container.querySelector("[data-presence-stack-user='1']"),
    ).toHaveAttribute("title", "Bea");
  });
});
