import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  InteractiveTimeline,
  type InteractiveTimelineEvent,
  InteractiveTimelineFilter,
  InteractiveTimelineToday,
  InteractiveTimelineToolbar,
  InteractiveTimelineZoomIn,
  InteractiveTimelineZoomOut,
} from "./interactive-timeline";

const TRACKS = [
  { color: "blue" as const, id: "release", label: "Releases" },
  { color: "red" as const, id: "incident", label: "Incidents" },
];

const EVENTS: InteractiveTimelineEvent[] = [
  {
    category: "feature",
    description: "Initial release",
    id: "v1",
    startDate: new Date("2024-06-01"),
    title: "v1.0",
    track: "release",
  },
  {
    category: "incident",
    endDate: new Date("2024-08-12"),
    id: "incident-1",
    startDate: new Date("2024-08-10"),
    title: "Outage",
    track: "incident",
  },
];

const CATEGORIES = [
  { color: "blue" as const, id: "feature", label: "Feature" },
  { color: "red" as const, id: "incident", label: "Incident" },
];

describe("InteractiveTimeline", () => {
  describe("rendering", () => {
    it("renders track labels and event markers", () => {
      const { container } = render(
        <InteractiveTimeline
          endDate={new Date("2025-01-01")}
          events={EVENTS}
          startDate={new Date("2024-01-01")}
          tracks={TRACKS}
        />,
      );

      expect(screen.getByText("Releases")).toBeInTheDocument();
      expect(screen.getByText("Incidents")).toBeInTheDocument();
      expect(
        container.querySelector("[data-event-id='v1']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-event-id='incident-1']"),
      ).toBeInTheDocument();
    });

    it("falls back to a single default track when none provided", () => {
      const { container } = render(
        <InteractiveTimeline
          endDate={new Date("2025-01-01")}
          events={EVENTS}
          startDate={new Date("2024-01-01")}
        />,
      );

      expect(
        container.querySelector("[data-track-id='default']"),
      ).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("fires onEventClick when a marker is clicked", () => {
      const onEventClick = vi.fn();
      const { container } = render(
        <InteractiveTimeline
          endDate={new Date("2025-01-01")}
          events={EVENTS}
          onEventClick={onEventClick}
          startDate={new Date("2024-01-01")}
          tracks={TRACKS}
        />,
      );

      const marker = container.querySelector("[data-event-id='v1']");
      expect(marker).not.toBeNull();
      if (marker) fireEvent.click(marker);

      expect(onEventClick).toHaveBeenCalledTimes(1);
      expect(onEventClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: "v1" }),
      );
    });

    it("marks the clicked event as selected via data-selected", () => {
      const { container } = render(
        <InteractiveTimeline
          endDate={new Date("2025-01-01")}
          events={EVENTS}
          startDate={new Date("2024-01-01")}
          tracks={TRACKS}
        />,
      );

      const marker = container.querySelector("[data-event-id='v1']");
      if (marker) fireEvent.click(marker);

      expect(container.querySelector("[data-event-id='v1']")).toHaveAttribute(
        "data-selected",
        "true",
      );
    });
  });

  describe("filtering", () => {
    it("hides events whose category is toggled off", () => {
      const { container } = render(
        <InteractiveTimeline
          categories={CATEGORIES}
          endDate={new Date("2025-01-01")}
          events={EVENTS}
          startDate={new Date("2024-01-01")}
          tracks={TRACKS}
        >
          <InteractiveTimelineToolbar>
            <InteractiveTimelineFilter categories={CATEGORIES} />
          </InteractiveTimelineToolbar>
        </InteractiveTimeline>,
      );

      const incidentChip = container.querySelector(
        "[data-category-id='incident']",
      );
      expect(incidentChip).not.toBeNull();
      if (incidentChip) fireEvent.click(incidentChip);

      expect(
        container.querySelector("[data-event-id='incident-1']"),
      ).toBeNull();
      expect(
        container.querySelector("[data-event-id='v1']"),
      ).toBeInTheDocument();
    });
  });

  describe("zoom controls", () => {
    it("doubles inner width on zoom-in and halves on zoom-out", () => {
      const { container } = render(
        <InteractiveTimeline
          endDate={new Date("2025-01-01")}
          events={EVENTS}
          startDate={new Date("2024-01-01")}
          tracks={TRACKS}
        >
          <InteractiveTimelineToolbar>
            <InteractiveTimelineZoomIn />
            <InteractiveTimelineZoomOut />
            <InteractiveTimelineToday />
          </InteractiveTimelineToolbar>
        </InteractiveTimeline>,
      );

      const readZoom = (): string | undefined =>
        container.querySelector<HTMLElement>("[data-zoom]")?.dataset.zoom;

      expect(readZoom()).toBe("1");

      fireEvent.click(screen.getByLabelText("Zoom in"));
      expect(readZoom()).toBe("2");

      fireEvent.click(screen.getByLabelText("Zoom out"));
      expect(readZoom()).toBe("1");
    });
  });

  describe("today marker", () => {
    it("renders the today marker when today falls in the visible window", () => {
      const today = new Date();
      const start = new Date(today.getTime() - 86_400_000);
      const end = new Date(today.getTime() + 86_400_000);

      const { container } = render(
        <InteractiveTimeline
          endDate={end}
          events={[]}
          startDate={start}
          tracks={TRACKS}
        />,
      );

      expect(
        container.querySelector("[data-testid='today-marker']"),
      ).toBeInTheDocument();
    });

    it("hides the today marker when outside the window", () => {
      const { container } = render(
        <InteractiveTimeline
          endDate={new Date("2010-12-31")}
          events={[]}
          startDate={new Date("2010-01-01")}
          tracks={TRACKS}
        />,
      );

      expect(
        container.querySelector("[data-testid='today-marker']"),
      ).toBeNull();
    });
  });
});
