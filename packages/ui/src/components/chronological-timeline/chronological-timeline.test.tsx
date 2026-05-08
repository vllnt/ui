import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChronoEvent, ChronologicalTimeline } from "./chronological-timeline";

describe("ChronologicalTimeline", () => {
  describe("rendering", () => {
    it("renders the title and event cards", () => {
      render(
        <ChronologicalTimeline title="The Space Race">
          <ChronoEvent date="October 4, 1957" id="sputnik" title="Sputnik 1">
            <p>First artificial satellite</p>
          </ChronoEvent>
          <ChronoEvent
            date="July 20, 1969"
            featured
            id="apollo"
            title="Apollo 11"
          >
            <p>First crewed Moon landing</p>
          </ChronoEvent>
        </ChronologicalTimeline>,
      );

      expect(screen.getByText("The Space Race")).toBeInTheDocument();
      expect(screen.getByText("Sputnik 1")).toBeInTheDocument();
      expect(screen.getByText("Apollo 11")).toBeInTheDocument();
    });

    it("uses the provided id for the article element", () => {
      const { container } = render(
        <ChronologicalTimeline title="History">
          <ChronoEvent date="1957" id="sputnik" title="Sputnik 1" />
        </ChronologicalTimeline>,
      );

      expect(container.querySelector("#sputnik")).toBeInTheDocument();
    });

    it("emits data-featured on featured events", () => {
      const { container } = render(
        <ChronologicalTimeline title="History">
          <ChronoEvent date="1969" featured id="apollo" title="Apollo 11" />
          <ChronoEvent date="1957" id="sputnik" title="Sputnik 1" />
        </ChronologicalTimeline>,
      );

      expect(
        container.querySelector("[data-event-id='apollo']"),
      ).toHaveAttribute("data-featured", "true");
      expect(
        container.querySelector("[data-event-id='sputnik']"),
      ).not.toHaveAttribute("data-featured");
    });

    it("alternates data-side between left and right per event", () => {
      const { container } = render(
        <ChronologicalTimeline title="History">
          <ChronoEvent date="1957" id="a" title="A" />
          <ChronoEvent date="1958" id="b" title="B" />
          <ChronoEvent date="1959" id="c" title="C" />
        </ChronologicalTimeline>,
      );

      const items = container.querySelectorAll("li[data-side]");
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveAttribute("data-side", "left");
      expect(items[1]).toHaveAttribute("data-side", "right");
      expect(items[2]).toHaveAttribute("data-side", "left");
    });
  });

  describe("media", () => {
    it("renders an image with alt text", () => {
      render(
        <ChronologicalTimeline title="History">
          <ChronoEvent
            date="1957"
            id="sputnik"
            media={{
              alt: "Sputnik satellite",
              credit: "NASA",
              src: "/sputnik.jpg",
              type: "image",
            }}
            title="Sputnik 1"
          />
        </ChronologicalTimeline>,
      );

      const image = screen.getByAltText("Sputnik satellite");
      expect(image).toHaveAttribute("src", "/sputnik.jpg");
      expect(screen.getByText("NASA")).toBeInTheDocument();
    });

    it("renders a video iframe with the title attribute", () => {
      const { container } = render(
        <ChronologicalTimeline title="History">
          <ChronoEvent
            date="1969"
            id="apollo"
            media={{
              src: "https://example.test/embed/abc",
              title: "Apollo 11 footage",
              type: "video",
            }}
            title="Apollo 11"
          />
        </ChronologicalTimeline>,
      );

      const iframe = container.querySelector("iframe");
      expect(iframe).toHaveAttribute("src", "https://example.test/embed/abc");
      expect(iframe).toHaveAttribute("title", "Apollo 11 footage");
    });

    it("renders an audio control with aria-label from alt", () => {
      const { container } = render(
        <ChronologicalTimeline title="History">
          <ChronoEvent
            date="1969"
            id="apollo"
            media={{
              alt: "Mission audio",
              src: "/apollo.mp3",
              type: "audio",
            }}
            title="Apollo 11"
          />
        </ChronologicalTimeline>,
      );

      const audio = container.querySelector("audio");
      expect(audio).toHaveAttribute("src", "/apollo.mp3");
      expect(audio).toHaveAttribute("aria-label", "Mission audio");
    });
  });

  describe("progress strip", () => {
    it("renders a progressbar landmark with the configured label", () => {
      render(
        <ChronologicalTimeline progressLabel="Story progress" title="History">
          <ChronoEvent date="1957" id="sputnik" title="Sputnik 1" />
        </ChronologicalTimeline>,
      );

      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-label", "Story progress");
    });

    it("hides the progress strip when there are no events", () => {
      render(<ChronologicalTimeline title="History" />);

      expect(screen.queryByRole("progressbar")).toBeNull();
    });
  });

  describe("compound contract", () => {
    it("throws when ChronoEvent is rendered outside the root", () => {
      const renderOrphan = (): void => {
        render(<ChronoEvent date="1957" id="sputnik" title="Sputnik 1" />);
      };

      expect(renderOrphan).toThrow(/ChronoEvent used outside/);
    });
  });
});
