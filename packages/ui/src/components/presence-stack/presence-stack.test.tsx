import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PresenceStack, type PresenceUser } from "./presence-stack";

const sample: PresenceUser[] = [
  { color: "#5b8def", id: "1", initial: "B", name: "Bea" },
  { color: "#10b981", id: "2", initial: "L", name: "Lior", status: "away" },
  { color: "#f59e0b", id: "3", initial: "S", name: "Sam", status: "idle" },
];

describe("PresenceStack", () => {
  it("renders one titled, colored avatar per visible user with status", () => {
    const { container } = render(<PresenceStack users={sample} />);
    const user = (id: string) =>
      container.querySelector(`[data-presence-stack-user='${id}']`);
    expect(
      container.querySelectorAll("[data-presence-stack-user]"),
    ).toHaveLength(3);
    expect(user("1")).toHaveStyle({ "background-color": "#5b8def" });
    expect(user("1")).toHaveAttribute("title", "Bea");
    expect(user("2")).toHaveAttribute("data-presence-stack-status", "away");
  });

  it("renders the overflow as a plain chip when users exceed max", () => {
    render(<PresenceStack max={2} users={sample} />);
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByLabelText("1 more")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the overflow as a button when onOverflowActivate is provided", () => {
    const handleClick = vi.fn();
    render(
      <PresenceStack max={2} onOverflowActivate={handleClick} users={sample} />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
