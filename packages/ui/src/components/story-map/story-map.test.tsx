import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StoryMap, StoryMapChapter } from "./story-map";

describe("StoryMap", () => {
  describe("rendering", () => {
    it("renders one chapter article per child", () => {
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
    });

    it("registers a marker per chapter on the SVG stages", () => {
      const { container } = render(
        <StoryMap>
          <StoryMapChapter center={[12.49, 41.89]} id="rome" title="Rome" />
          <StoryMapChapter
            center={[28.98, 41.01]}
            id="constantinople"
            title="Constantinople"
          />
        </StoryMap>,
      );

      const markers = container.querySelectorAll("[data-marker-id='rome']");
      expect(markers.length).toBeGreaterThan(0);
      const otherMarkers = container.querySelectorAll(
        "[data-marker-id='constantinople']",
      );
      expect(otherMarkers.length).toBeGreaterThan(0);
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
  });

  describe("compound contract", () => {
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
  });

  describe("progress strip", () => {
    it("renders a progressbar landmark with the configured label", () => {
      render(
        <StoryMap labels={{ progress: "Story progress" }}>
          <StoryMapChapter center={[0, 0]} id="x" title="x" />
        </StoryMap>,
      );

      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-label", "Story progress");
    });
  });

  describe("backdrop", () => {
    it("renders a backdrop image when backdrop is set", () => {
      const { container } = render(
        <StoryMap backdrop="/world.svg" backdropAlt="World">
          <StoryMapChapter center={[0, 0]} id="x" title="x" />
        </StoryMap>,
      );

      const images = container.querySelectorAll("image");
      expect(images.length).toBeGreaterThan(0);
      expect(images[0]).toHaveAttribute("href", "/world.svg");
    });
  });
});
