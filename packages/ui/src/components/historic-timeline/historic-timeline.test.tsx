import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  type HistoricCategory,
  type HistoricEra,
  type HistoricEvent,
  type HistoricPeriod,
  HistoricTimeline,
} from "./historic-timeline";

const ERAS: HistoricEra[] = [
  {
    color: "amber",
    endYear: 476,
    id: "ancient",
    name: "Ancient",
    startYear: -3000,
  },
  {
    color: "emerald",
    endYear: 1453,
    id: "medieval",
    name: "Medieval",
    startYear: 476,
  },
  {
    color: "blue",
    endYear: 2025,
    id: "modern",
    name: "Modern",
    startYear: 1453,
  },
];

const CATEGORIES: HistoricCategory[] = [
  { color: "blue", id: "science", label: "Science" },
  { color: "red", id: "conflict", label: "Conflict" },
];

const EVENTS: HistoricEvent[] = [
  { category: "science", id: "olympics", title: "First Olympics", year: -776 },
  { category: "science", id: "moon", title: "Moon landing", year: 1969 },
];

const PERIODS: HistoricPeriod[] = [
  {
    category: "conflict",
    endYear: 1453,
    id: "100yr",
    startYear: 1337,
    title: "Hundred Years' War",
  },
];

describe("HistoricTimeline", () => {
  describe("rendering", () => {
    it("renders era labels and event titles", () => {
      render(
        <HistoricTimeline
          endYear={2025}
          eras={ERAS}
          events={EVENTS}
          startYear={-3000}
        />,
      );

      expect(screen.getByText("Ancient")).toBeInTheDocument();
      expect(screen.getByText("Medieval")).toBeInTheDocument();
      expect(screen.getByText("First Olympics")).toBeInTheDocument();
      expect(screen.getByText("Moon landing")).toBeInTheDocument();
    });

    it("renders period bars when provided", () => {
      const { container } = render(
        <HistoricTimeline endYear={2025} periods={PERIODS} startYear={-3000} />,
      );

      expect(
        container.querySelector("[data-period-id='100yr']"),
      ).toBeInTheDocument();
    });

    it("renders the category legend when categories are provided", () => {
      render(
        <HistoricTimeline
          categories={CATEGORIES}
          endYear={2025}
          startYear={-3000}
        />,
      );

      expect(screen.getByText("Science")).toBeInTheDocument();
      expect(screen.getByText("Conflict")).toBeInTheDocument();
    });

    it("renders BCE on negative years and CE on positive years", () => {
      render(
        <HistoricTimeline endYear={2025} events={EVENTS} startYear={-3000} />,
      );

      expect(screen.getByText(/776 BCE/)).toBeInTheDocument();
      expect(screen.getByText(/1969 CE/)).toBeInTheDocument();
    });

    it("renders an event title as a link when href is set", () => {
      render(
        <HistoricTimeline
          endYear={2025}
          events={[
            {
              category: "science",
              href: "/events/moon",
              id: "moon",
              title: "Moon landing",
              year: 1969,
            },
          ]}
          startYear={-3000}
        />,
      );

      const link = screen.getByRole("link", { name: "Moon landing" });
      expect(link).toHaveAttribute("href", "/events/moon");
    });
  });

  describe("clipping", () => {
    it("hides events outside the visible window", () => {
      const { container } = render(
        <HistoricTimeline
          endYear={500}
          events={[
            { id: "in", title: "In range", year: 0 },
            { id: "out-before", title: "Too early", year: -1000 },
            { id: "out-after", title: "Too late", year: 1000 },
          ]}
          startYear={-500}
        />,
      );

      expect(
        container.querySelector("[data-event-id='in']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-event-id='out-before']"),
      ).toBeNull();
      expect(container.querySelector("[data-event-id='out-after']")).toBeNull();
    });

    it("hides eras with non-positive width inside the visible window", () => {
      const { container } = render(
        <HistoricTimeline
          endYear={500}
          eras={[
            { endYear: -200, id: "before", name: "Before", startYear: -1000 },
          ]}
          startYear={-500}
        />,
      );

      expect(container.querySelector("[data-era-id]")).not.toBeNull();
    });
  });

  describe("data attributes", () => {
    it("emits data-event-id and data-event-year per marker", () => {
      const { container } = render(
        <HistoricTimeline endYear={2025} events={EVENTS} startYear={-3000} />,
      );

      const markers = container.querySelectorAll("[data-event-id]");
      expect(markers.length).toBe(2);
      expect(markers[0]).toHaveAttribute("data-event-year", "-776");
      expect(markers[1]).toHaveAttribute("data-event-year", "1969");
    });
  });
});
