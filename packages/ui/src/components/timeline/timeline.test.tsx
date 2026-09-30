import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Timeline, TimelineItem } from "./timeline";

describe("Timeline", () => {
  it("renders an ordered list with item titles", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem date="Jan 2026" status="completed" title="Started" />
        <TimelineItem date="Mar 2026" status="active" title="MVP" />
        <TimelineItem date="Jul 2026" isLast status="upcoming" title="V2" />
      </Timeline>,
    );
    expect(container.querySelector("ol")).toBeInTheDocument();
    expect(screen.getByText("Started")).toBeInTheDocument();
    expect(screen.getByText("MVP")).toBeInTheDocument();
    expect(screen.getByText("V2")).toBeInTheDocument();
  });

  it("emits data-orientation, data-status, and horizontal connector classes", () => {
    const { container } = render(
      <Timeline orientation="horizontal">
        <TimelineItem status="completed" title="A" />
        <TimelineItem isLast status="upcoming" title="B" />
      </Timeline>,
    );
    expect(container.querySelector("ol")).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
    const items = container.querySelectorAll("li[data-status]");
    expect(items.length).toBe(2);
    expect(items[0]).toHaveAttribute("data-status", "completed");
    expect(items[1]).toHaveAttribute("data-status", "upcoming");
    expect(container.querySelector("li .border-t-2")).not.toBeNull();
  });

  it("renders the date caption, description, and rich children when provided", () => {
    render(
      <Timeline>
        <TimelineItem
          date="Jan 2026"
          description="Initial planning"
          isLast
          title="Started"
        >
          <p data-testid="rich">Rich content</p>
        </TimelineItem>
      </Timeline>,
    );
    expect(screen.getByText("Jan 2026")).toBeInTheDocument();
    expect(screen.getByText("Initial planning")).toBeInTheDocument();
    expect(screen.getByTestId("rich")).toHaveTextContent("Rich content");
  });

  it("renders a connector for non-last items", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem status="completed" title="A" />
        <TimelineItem isLast status="upcoming" title="B" />
      </Timeline>,
    );
    const items = container.querySelectorAll("li");
    expect(items[0]?.querySelector(".border-l-2")).not.toBeNull();
    expect(items[1]?.querySelector(".border-l-2")).toBeNull();
  });

  it.each(["completed", "active", "upcoming"] as const)(
    "renders the %s status",
    (status) => {
      render(
        <Timeline>
          <TimelineItem isLast status={status} title="A" />
        </Timeline>,
      );

      expect(screen.getByText("A")).toBeInTheDocument();
    },
  );
});
