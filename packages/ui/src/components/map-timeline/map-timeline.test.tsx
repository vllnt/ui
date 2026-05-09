import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  MapTimeline,
  MapTimelineControls,
  MapTimelineEvent,
  MapTimelineLayer,
  MapTimelinePlayButton,
  MapTimelineSlider,
} from "./map-timeline";

const ROMAN_RING: [number, number][] = [
  [-5, 50],
  [40, 50],
  [40, 30],
  [-5, 30],
  [-5, 50],
];

describe("MapTimeline", () => {
  describe("layer visibility", () => {
    it("renders a layer when the year falls inside its window", () => {
      const { container } = render(
        <MapTimeline endYear={500} initialYear={100} startYear={-100}>
          <MapTimelineLayer
            color="red"
            endYear={476}
            geometry={{ polygon: ROMAN_RING, type: "polygon" }}
            id="rome"
            label="Roman Empire"
            startYear={-27}
          />
        </MapTimeline>,
      );

      expect(container.querySelector("[data-layer-id='rome']")).toHaveAttribute(
        "data-state",
        "visible",
      );
      expect(screen.getByText("Roman Empire")).toBeInTheDocument();
    });

    it("hides a layer when the year is outside its window", () => {
      const { container } = render(
        <MapTimeline endYear={500} initialYear={500} startYear={-100}>
          <MapTimelineLayer
            color="red"
            endYear={476}
            geometry={{ polygon: ROMAN_RING, type: "polygon" }}
            id="rome"
            label="Roman Empire"
            startYear={-27}
          />
        </MapTimeline>,
      );

      expect(container.querySelector("[data-layer-id='rome']")).toBeNull();
    });
  });

  describe("event visibility", () => {
    it("renders an event when the year matches", () => {
      const { container } = render(
        <MapTimeline endYear={200} initialYear={79} startYear={0}>
          <MapTimelineEvent
            id="vesuvius"
            position={[14.48, 40.75]}
            title="Vesuvius"
            year={79}
          />
        </MapTimeline>,
      );

      expect(
        container.querySelector("[data-event-id='vesuvius']"),
      ).toBeInTheDocument();
    });

    it("renders an event within the tolerance window", () => {
      const { container } = render(
        <MapTimeline endYear={200} initialYear={82} startYear={0}>
          <MapTimelineEvent
            id="vesuvius"
            position={[14.48, 40.75]}
            title="Vesuvius"
            toleranceYears={5}
            year={79}
          />
        </MapTimeline>,
      );

      expect(
        container.querySelector("[data-event-id='vesuvius']"),
      ).toBeInTheDocument();
    });

    it("hides an event outside the tolerance window", () => {
      const { container } = render(
        <MapTimeline endYear={200} initialYear={150} startYear={0}>
          <MapTimelineEvent
            id="vesuvius"
            position={[14.48, 40.75]}
            title="Vesuvius"
            toleranceYears={5}
            year={79}
          />
        </MapTimeline>,
      );

      expect(container.querySelector("[data-event-id='vesuvius']")).toBeNull();
    });
  });

  describe("slider", () => {
    it("updates the visible year and fires onYearChange when the slider moves", () => {
      const onYearChange = vi.fn();
      const { container } = render(
        <MapTimeline
          endYear={500}
          initialYear={100}
          onYearChange={onYearChange}
          startYear={-100}
        >
          <MapTimelineLayer
            endYear={476}
            geometry={{ polygon: ROMAN_RING, type: "polygon" }}
            id="rome"
            startYear={-27}
          />
          <MapTimelineControls>
            <MapTimelineSlider />
          </MapTimelineControls>
        </MapTimeline>,
      );

      const slider = container.querySelector<HTMLInputElement>(
        "input[type='range']",
      );
      expect(slider).not.toBeNull();
      if (slider) fireEvent.change(slider, { target: { value: "300" } });

      expect(onYearChange).toHaveBeenCalledWith(300);
      expect(
        container.querySelector("[data-current-year='300']"),
      ).toBeInTheDocument();
    });
  });

  describe("play button", () => {
    it("toggles aria-pressed and the data-playing attribute on click", () => {
      render(
        <MapTimeline endYear={500} initialYear={0} startYear={0}>
          <MapTimelineControls>
            <MapTimelinePlayButton />
          </MapTimelineControls>
        </MapTimeline>,
      );

      const button = screen.getByRole("button", { name: "Play" });
      expect(button).toHaveAttribute("aria-pressed", "false");

      fireEvent.click(button);
      const pause = screen.getByRole("button", { name: "Pause" });
      expect(pause).toHaveAttribute("aria-pressed", "true");
      expect(pause).toHaveAttribute("data-playing", "true");
    });
  });

  describe("compound contract", () => {
    it("throws when subcomponents render outside the root", () => {
      const renderOrphan = (): void => {
        render(<MapTimelineSlider />);
      };

      expect(renderOrphan).toThrow(/MapTimeline subcomponent/);
    });
  });
});
