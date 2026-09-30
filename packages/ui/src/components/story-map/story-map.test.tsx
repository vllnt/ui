import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StoryMap, StoryMapChapter } from "./story-map";

describe("StoryMap", () => {
  it("renders one chapter article and marker per child", () => {
    const { container } = render(
      <StoryMap>
        <StoryMapChapter
          center={[12.49, 41.89]}
          id="rome"
          title="The Fall of Rome"
        >
          <p>Rome fell.</p>
        </StoryMapChapter>
        <StoryMapChapter
          center={[28.98, 41.01]}
          id="constantinople"
          title="Constantinople Endures"
        >
          <p>Byzantium thrived.</p>
        </StoryMapChapter>
      </StoryMap>,
    );
    expect(
      container.querySelector("[data-chapter-id='rome']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-chapter-id='constantinople']"),
    ).toBeInTheDocument();
    expect(screen.getByText("The Fall of Rome")).toBeInTheDocument();
    expect(screen.getByText("Constantinople Endures")).toBeInTheDocument();
    expect(
      container.querySelectorAll("[data-marker-id='rome']").length,
    ).toBeGreaterThan(0);
    expect(
      container.querySelectorAll("[data-marker-id='constantinople']").length,
    ).toBeGreaterThan(0);
  });

  it("renders an image when chapter media is set", () => {
    render(
      <StoryMap>
        <StoryMapChapter
          center={[12.49, 41.89]}
          id="rome"
          media={{ alt: "Forum", src: "/forum.jpg", type: "image" }}
          title="Rome"
        />
      </StoryMap>,
    );
    const image = screen.getByAltText("Forum");
    expect(image).toHaveAttribute("src", "/forum.jpg");
  });

  it("throws when StoryMapChapter renders outside the root", () => {
    const renderOrphan = (): void => {
      render(
        <StoryMapChapter center={[0, 0]} id="x" title="orphan">
          <p>body</p>
        </StoryMapChapter>,
      );
    };
    expect(renderOrphan).toThrow(/StoryMap subcomponent/);
  });

  it("renders a labelled progressbar and the backdrop image", () => {
    const { container } = render(
      <StoryMap
        backdrop="/world.svg"
        backdropAlt="World"
        labels={{ progress: "Story progress" }}
      >
        <StoryMapChapter center={[0, 0]} id="x" title="x" />
      </StoryMap>,
    );
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-label", "Story progress");
    const images = container.querySelectorAll("image");
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute("href", "/world.svg");
  });
});
