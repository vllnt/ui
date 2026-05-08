import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Timeline, TimelineItem } from "./timeline";

describe("Timeline", () => {
  describe("rendering", () => {
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

    it("emits data-orientation on the root and data-status on items", () => {
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
    });

    it("renders the date caption when provided", () => {
      render(
        <Timeline>
          <TimelineItem date="Jan 2026" isLast title="Started" />
        </Timeline>,
      );

      expect(screen.getByText("Jan 2026")).toBeInTheDocument();
    });

    it("renders the description when provided", () => {
      render(
        <Timeline>
          <TimelineItem description="Initial planning" isLast title="Started" />
        </Timeline>,
      );

      expect(screen.getByText("Initial planning")).toBeInTheDocument();
    });

    it("renders rich children inside the item body", () => {
      render(
        <Timeline>
          <TimelineItem isLast title="Started">
            <p data-testid="rich">Rich content</p>
          </TimelineItem>
        </Timeline>,
      );

      expect(screen.getByTestId("rich")).toHaveTextContent("Rich content");
    });
  });

  describe("connector", () => {
    it("renders a connector for non-last items", () => {
      const { container } = render(
        <Timeline>
          <TimelineItem status="completed" title="A" />
          <TimelineItem isLast status="upcoming" title="B" />
        </Timeline>,
      );

      const items = container.querySelectorAll("li");
      const firstHasConnector = items[0]?.querySelector(".border-l-2");
      const lastHasConnector = items[1]?.querySelector(".border-l-2");
      expect(firstHasConnector).not.toBeNull();
      expect(lastHasConnector).toBeNull();
    });

    it("uses horizontal connector classes when orientation=horizontal", () => {
      const { container } = render(
        <Timeline orientation="horizontal">
          <TimelineItem status="completed" title="A" />
          <TimelineItem isLast status="upcoming" title="B" />
        </Timeline>,
      );

      expect(container.querySelector("li .border-t-2")).not.toBeNull();
    });
  });

  describe("status palette", () => {
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
});
