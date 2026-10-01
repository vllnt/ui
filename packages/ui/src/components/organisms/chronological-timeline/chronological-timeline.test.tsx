import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChronoEvent, ChronologicalTimeline } from "./chronological-timeline";

describe("ChronologicalTimeline", () => {
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

  it("uses event ids, flags featured events, alternates sides, and labels the progressbar", () => {
    const { container } = render(
      <ChronologicalTimeline progressLabel="Story progress" title="History">
        <ChronoEvent date="1969" featured id="apollo" title="Apollo 11" />
        <ChronoEvent date="1957" id="sputnik" title="Sputnik 1" />
        <ChronoEvent date="1959" id="c" title="C" />
      </ChronologicalTimeline>,
    );
    expect(container.querySelector("#sputnik")).toBeInTheDocument();
    expect(container.querySelector("[data-event-id='apollo']")).toHaveAttribute(
      "data-featured",
      "true",
    );
    expect(
      container.querySelector("[data-event-id='sputnik']"),
    ).not.toHaveAttribute("data-featured");
    const items = container.querySelectorAll("li[data-side]");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute("data-side", "left");
    expect(items[1]).toHaveAttribute("data-side", "right");
    expect(items[2]).toHaveAttribute("data-side", "left");
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "Story progress",
    );
  });

  it("renders image, video, and audio media", () => {
    const { container } = render(
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
        <ChronoEvent
          date="1969"
          id="apollo-audio"
          media={{ alt: "Mission audio", src: "/apollo.mp3", type: "audio" }}
          title="Apollo 11 audio"
        />
      </ChronologicalTimeline>,
    );
    expect(screen.getByAltText("Sputnik satellite")).toHaveAttribute(
      "src",
      "/sputnik.jpg",
    );
    expect(screen.getByText("NASA")).toBeInTheDocument();
    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", "https://example.test/embed/abc");
    expect(iframe).toHaveAttribute("title", "Apollo 11 footage");
    const audio = container.querySelector("audio");
    expect(audio).toHaveAttribute("src", "/apollo.mp3");
    expect(audio).toHaveAttribute("aria-label", "Mission audio");
  });

  it("hides the progress strip when there are no events", () => {
    render(<ChronologicalTimeline title="History" />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("throws when ChronoEvent is rendered outside the root", () => {
    expect(() =>
      render(<ChronoEvent date="1957" id="sputnik" title="Sputnik 1" />),
    ).toThrow(/ChronoEvent used outside/);
  });
});

describe("ChronologicalTimeline list semantics", () => {
  it("wraps a single event in a list item", () => {
    render(
      <ChronologicalTimeline title="Firsts">
        <ChronoEvent date="1957" id="sputnik" title="Sputnik 1" />
      </ChronologicalTimeline>,
    );
    const list = screen.getByRole("list");
    expect(list.children).toHaveLength(1);
    expect(list.firstElementChild?.tagName).toBe("LI");
  });
});
