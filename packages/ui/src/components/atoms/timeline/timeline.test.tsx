import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Timeline, TimelineItem, type TimelineItemStatus } from "./timeline";

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

describe("Timeline status text alternative", () => {
  it.each<[TimelineItemStatus, string]>([
    ["completed", "Completed"],
    ["active", "In progress"],
    ["upcoming", "Upcoming"],
  ])("exposes a visually hidden word for the %s status", (status, word) => {
    render(
      <Timeline>
        <TimelineItem isLast status={status} title="A" />
      </Timeline>,
    );
    const item = screen.getByRole("listitem");
    const hidden = within(item).getByText(word);

    expect(hidden).toHaveClass("sr-only");
    expect(hidden.closest('[aria-hidden="true"]')).toBeNull();
    expect(item).toHaveTextContent(word);
  });

  it("keeps the marker glyph decorative", () => {
    render(
      <Timeline>
        <TimelineItem isLast status="completed" title="A" />
      </Timeline>,
    );
    const item = screen.getByRole("listitem");

    expect(item.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    expect(item.querySelector('[aria-hidden="true"]')).not.toContainElement(
      within(item).getByText("Completed"),
    );
  });

  it("falls back to the upcoming word when status is omitted", () => {
    render(
      <Timeline>
        <TimelineItem isLast title="A" />
      </Timeline>,
    );

    expect(screen.getByRole("listitem")).toHaveTextContent("Upcoming");
  });

  it("renders the word for an item used outside a Timeline", () => {
    render(
      <ol>
        <TimelineItem isLast status="active" title="A" />
      </ol>,
    );

    expect(screen.getByText("In progress")).toHaveClass("sr-only");
  });

  it("overrides the words through Timeline labels and keeps the other defaults", () => {
    render(
      <Timeline labels={{ completed: "Terminé" }}>
        <TimelineItem status="completed" title="A" />
        <TimelineItem isLast status="active" title="B" />
      </Timeline>,
    );
    const [first, second] = screen.getAllByRole("listitem");

    expect(first).toHaveTextContent("Terminé");
    expect(first).not.toHaveTextContent("Completed");
    expect(second).toHaveTextContent("In progress");
  });

  it("lets an item labels override the Timeline labels", () => {
    render(
      <Timeline labels={{ active: "En cours" }}>
        <TimelineItem labels={{ active: "Actuel" }} status="active" title="A" />
        <TimelineItem isLast status="active" title="B" />
      </Timeline>,
    );
    const [first, second] = screen.getAllByRole("listitem");

    expect(first).toHaveTextContent("Actuel");
    expect(first).not.toHaveTextContent("En cours");
    expect(second).toHaveTextContent("En cours");
  });

  it("falls back to the default when a label is undefined", () => {
    render(
      <Timeline labels={{ completed: undefined }}>
        <TimelineItem isLast status="completed" title="A" />
      </Timeline>,
    );

    expect(screen.getByRole("listitem")).toHaveTextContent("Completed");
  });

  it("omits the hidden word when a label is an empty string", () => {
    render(
      <Timeline labels={{ completed: "" }}>
        <TimelineItem isLast status="completed" title="A" />
      </Timeline>,
    );

    expect(
      within(screen.getByRole("listitem")).queryByText("Completed"),
    ).toBeNull();
    expect(screen.getByRole("listitem").querySelector(".sr-only")).toBeNull();
  });

  it("does not forward labels to the list element", () => {
    const { container } = render(
      <Timeline labels={{ completed: "Done" }}>
        <TimelineItem isLast labels={{ completed: "Done" }} title="A" />
      </Timeline>,
    );

    expect(container.querySelector("ol")).not.toHaveAttribute("labels");
    expect(container.querySelector("li")).not.toHaveAttribute("labels");
  });

  it("renders an empty list without items", () => {
    render(<Timeline labels={{ completed: "Done" }} />);

    expect(screen.getByRole("list")).toBeEmptyDOMElement();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
