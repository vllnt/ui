import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ParallelTimeline,
  type ParallelTimelineTrack,
} from "./parallel-timeline";

const TRACKS: ParallelTimelineTrack[] = [
  {
    color: "red",
    events: [
      { id: "augustus", title: "Augustus becomes Emperor", year: -27 },
      { id: "fall", title: "Fall of Western Rome", year: 476 },
    ],
    id: "rome",
    name: "Rome",
  },
  {
    color: "amber",
    events: [
      { id: "qin", title: "Qin unifies China", year: -221 },
      { id: "han-end", title: "End of Han Dynasty", year: 220 },
    ],
    id: "china",
    name: "China",
    region: "East Asia",
  },
];

describe("ParallelTimeline", () => {
  describe("rendering", () => {
    it("renders all track names + events", () => {
      render(
        <ParallelTimeline endYear={500} startYear={-500} tracks={TRACKS} />,
      );

      expect(screen.getByText("Rome")).toBeInTheDocument();
      expect(screen.getByText("China")).toBeInTheDocument();
      expect(screen.getByText("Augustus becomes Emperor")).toBeInTheDocument();
      expect(screen.getByText("Qin unifies China")).toBeInTheDocument();
    });

    it("renders region when provided", () => {
      render(
        <ParallelTimeline endYear={500} startYear={-500} tracks={TRACKS} />,
      );

      expect(screen.getByText("East Asia")).toBeInTheDocument();
    });

    it("emits data-track-id and data-event-id", () => {
      const { container } = render(
        <ParallelTimeline endYear={500} startYear={-500} tracks={TRACKS} />,
      );

      const trackNodes = container.querySelectorAll("[data-track-id]");
      expect(trackNodes.length).toBe(2);
      expect(trackNodes[0]).toHaveAttribute("data-track-id", "rome");
      expect(trackNodes[1]).toHaveAttribute("data-track-id", "china");

      const eventNodes = container.querySelectorAll("[data-event-id]");
      expect(eventNodes.length).toBe(4);
    });

    it("renders BCE / CE on event meta lines", () => {
      render(
        <ParallelTimeline
          endYear={500}
          startYear={-500}
          tracks={[
            {
              events: [
                { id: "before", title: "Before", year: -100 },
                { id: "after", title: "After", year: 100 },
              ],
              id: "track",
              name: "Track",
            },
          ]}
        />,
      );

      expect(screen.getByText("100 BCE")).toBeInTheDocument();
      expect(screen.getByText("100 CE")).toBeInTheDocument();
    });
  });

  describe("clipping", () => {
    it("hides events outside the visible window", () => {
      const { container } = render(
        <ParallelTimeline
          endYear={100}
          startYear={-100}
          tracks={[
            {
              events: [
                { id: "in", title: "In range", year: 0 },
                { id: "out-before", title: "Too early", year: -500 },
                { id: "out-after", title: "Too late", year: 500 },
              ],
              id: "track",
              name: "Track",
            },
          ]}
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
  });

  describe("eras", () => {
    it("renders era bands when provided", () => {
      const { container } = render(
        <ParallelTimeline
          endYear={500}
          eras={[
            {
              color: "neutral",
              end: 500,
              id: "antiquity",
              name: "Antiquity",
              start: -500,
            },
          ]}
          startYear={-500}
          tracks={TRACKS}
        />,
      );

      const band = container.querySelector("[data-era-id='antiquity']");
      expect(band).toBeInTheDocument();
    });
  });
});
