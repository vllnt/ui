import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OverviewBoard, type OverviewBoardItem } from "./overview-board";

const errorItem: OverviewBoardItem = {
  ctaLabel: "Review errors",
  description: "Two checks need attention.",
  handleCtaClick: vi.fn(),
  heading: "Error budget",
  id: "errors",
  metric: "2",
  tone: "danger",
};

const actionItem: OverviewBoardItem = {
  description: "One action is waiting.",
  heading: "Action queue",
  id: "actions",
  metric: "1",
  tone: "warning",
};

const items: OverviewBoardItem[] = [errorItem, actionItem];

describe("OverviewBoard", () => {
  it("renders board copy and item metrics", () => {
    render(
      <OverviewBoard
        eyebrow="Operations"
        heading="Run overview"
        items={items}
        subtitle="Critical work at a glance."
      />,
    );

    expect(screen.getByText("Operations")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Run overview" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Critical work at a glance.")).toBeInTheDocument();
    expect(screen.getByText("Error budget")).toBeInTheDocument();
    expect(screen.getByText("Two checks need attention.")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders default icons based on heading text", () => {
    const { container } = render(
      <OverviewBoard heading="Run overview" items={items} />,
    );

    expect(container.querySelector(".lucide-circle-alert")).toBeInTheDocument();
    expect(container.querySelector(".lucide-list-todo")).toBeInTheDocument();
  });

  it("renders CTA buttons only when configured and calls the item handler", () => {
    const handleCtaClick = vi.fn();
    render(
      <OverviewBoard
        heading="Run overview"
        items={[{ ...errorItem, handleCtaClick }, actionItem]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /review errors/i }));

    expect(handleCtaClick).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("button", { name: /action queue/i }),
    ).not.toBeInTheDocument();
  });
});
