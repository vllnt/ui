import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  PrimarySourceAnnotation,
  PrimarySourceAnnotations,
  PrimarySourceContext,
  PrimarySourceMetadata,
  PrimarySourceQuestions,
  PrimarySourceRotate,
  PrimarySourceToolbar,
  PrimarySourceTranscription,
  PrimarySourceViewer,
  PrimarySourceZoomIn,
  PrimarySourceZoomOut,
} from "./primary-source-viewer";

const SOURCE = {
  alt: "Magna Carta manuscript",
  src: "/magna-carta.jpg",
  type: "image" as const,
};

describe("PrimarySourceViewer", () => {
  describe("rendering", () => {
    it("renders the title, period and origin", () => {
      render(
        <PrimarySourceViewer
          origin="England"
          period="Medieval"
          source={SOURCE}
          title="Magna Carta (1215)"
        />,
      );

      expect(screen.getByText("Magna Carta (1215)")).toBeInTheDocument();
      expect(screen.getByText(/Medieval/)).toBeInTheDocument();
      expect(screen.getByText(/England/)).toBeInTheDocument();
    });

    it("renders the source image with alt text", () => {
      render(
        <PrimarySourceViewer source={SOURCE} title="Magna Carta (1215)" />,
      );

      const image = screen.getByAltText("Magna Carta manuscript");
      expect(image).toHaveAttribute("src", "/magna-carta.jpg");
    });

    it("starts with zoom 1 and rotation 0", () => {
      const { container } = render(
        <PrimarySourceViewer source={SOURCE} title="Magna Carta (1215)" />,
      );

      const stage = container.querySelector("[data-zoom][data-rotation]");
      expect(stage).toHaveAttribute("data-zoom", "1");
      expect(stage).toHaveAttribute("data-rotation", "0");
    });
  });

  describe("toolbar", () => {
    it("zoom-in / zoom-out scale the stage", () => {
      const { container } = render(
        <PrimarySourceViewer source={SOURCE} title="Doc">
          <PrimarySourceToolbar>
            <PrimarySourceZoomIn />
            <PrimarySourceZoomOut />
          </PrimarySourceToolbar>
        </PrimarySourceViewer>,
      );

      const readZoom = (): string | undefined =>
        container.querySelector<HTMLElement>("[data-zoom]")?.dataset.zoom;

      expect(readZoom()).toBe("1");

      fireEvent.click(screen.getByLabelText("Zoom in"));
      expect(readZoom()).toBe("1.25");

      fireEvent.click(screen.getByLabelText("Zoom out"));
      expect(readZoom()).toBe("1");
    });

    it("rotate cycles 90 / 180 / 270 / 0", () => {
      const { container } = render(
        <PrimarySourceViewer source={SOURCE} title="Doc">
          <PrimarySourceToolbar>
            <PrimarySourceRotate />
          </PrimarySourceToolbar>
        </PrimarySourceViewer>,
      );

      const readRotation = (): string | undefined =>
        container.querySelector<HTMLElement>("[data-rotation]")?.dataset
          .rotation;

      const rotateButton = screen.getByLabelText("Rotate");

      fireEvent.click(rotateButton);
      expect(readRotation()).toBe("90");

      fireEvent.click(rotateButton);
      fireEvent.click(rotateButton);
      fireEvent.click(rotateButton);
      expect(readRotation()).toBe("0");
    });
  });

  describe("annotations", () => {
    it("renders the annotation rectangle in source-percent coordinates", () => {
      const { container } = render(
        <PrimarySourceViewer source={SOURCE} title="Doc">
          <PrimarySourceAnnotations>
            <PrimarySourceAnnotation
              category="Artifact"
              id="seal"
              note="Royal seal of King John"
              region={{ height: 8, width: 20, x: 12, y: 6 }}
            />
          </PrimarySourceAnnotations>
        </PrimarySourceViewer>,
      );

      const annotation = container.querySelector("[data-annotation-id='seal']");
      expect(annotation).not.toBeNull();
      expect(annotation).toHaveStyle({ left: "12%", top: "6%" });
      expect(annotation).toHaveAttribute(
        "aria-label",
        "Royal seal of King John",
      );
    });
  });

  describe("slots", () => {
    it("renders transcription, metadata and discussion questions", () => {
      render(
        <PrimarySourceViewer source={SOURCE} title="Doc">
          <PrimarySourceTranscription>
            <p>John, by the grace of God</p>
          </PrimarySourceTranscription>
          <PrimarySourceContext>
            <PrimarySourceMetadata>
              <dt>Date</dt>
              <dd>June 15, 1215</dd>
            </PrimarySourceMetadata>
            <PrimarySourceQuestions>
              <p>What rights does this establish?</p>
            </PrimarySourceQuestions>
          </PrimarySourceContext>
        </PrimarySourceViewer>,
      );

      expect(screen.getByText("John, by the grace of God")).toBeInTheDocument();
      expect(screen.getByText("June 15, 1215")).toBeInTheDocument();
      expect(
        screen.getByText("What rights does this establish?"),
      ).toBeInTheDocument();
    });
  });

  describe("compound contract", () => {
    it("throws when subcomponents render outside the root", () => {
      const renderOrphan = (): void => {
        render(<PrimarySourceZoomIn />);
      };

      expect(renderOrphan).toThrow(/PrimarySourceViewer subcomponent/);
    });
  });
});
