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
  it("renders the title, period, origin and source image at zoom 1 / rotation 0", () => {
    const { container } = render(
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
    expect(screen.getByAltText("Magna Carta manuscript")).toHaveAttribute(
      "src",
      "/magna-carta.jpg",
    );
    const stage = container.querySelector("[data-zoom][data-rotation]");
    expect(stage).toHaveAttribute("data-zoom", "1");
    expect(stage).toHaveAttribute("data-rotation", "0");
  });

  it("zoom-in / zoom-out scale the stage and rotate cycles 90 / 180 / 270 / 0", () => {
    const { container } = render(
      <PrimarySourceViewer source={SOURCE} title="Doc">
        <PrimarySourceToolbar>
          <PrimarySourceZoomIn />
          <PrimarySourceZoomOut />
          <PrimarySourceRotate />
        </PrimarySourceToolbar>
      </PrimarySourceViewer>,
    );
    const stage = () => container.querySelector<HTMLElement>("[data-zoom]");
    expect(stage()?.dataset.zoom).toBe("1");
    fireEvent.click(screen.getByLabelText("Zoom in"));
    expect(stage()?.dataset.zoom).toBe("1.25");
    fireEvent.click(screen.getByLabelText("Zoom out"));
    expect(stage()?.dataset.zoom).toBe("1");
    const rotateButton = screen.getByLabelText("Rotate");
    fireEvent.click(rotateButton);
    expect(stage()?.dataset.rotation).toBe("90");
    fireEvent.click(rotateButton);
    fireEvent.click(rotateButton);
    fireEvent.click(rotateButton);
    expect(stage()?.dataset.rotation).toBe("0");
  });

  it("renders annotations, transcription, metadata and discussion questions", () => {
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
    const annotation = container.querySelector("[data-annotation-id='seal']");
    expect(annotation).not.toBeNull();
    expect(annotation).toHaveStyle({ left: "12%", top: "6%" });
    expect(annotation).toHaveAttribute("aria-label", "Royal seal of King John");
    expect(screen.getByText("John, by the grace of God")).toBeInTheDocument();
    expect(screen.getByText("June 15, 1215")).toBeInTheDocument();
    expect(
      screen.getByText("What rights does this establish?"),
    ).toBeInTheDocument();
  });

  it("throws when subcomponents render outside the root", () => {
    expect(() => render(<PrimarySourceZoomIn />)).toThrow(
      /PrimarySourceViewer subcomponent/,
    );
  });
});

describe("PrimarySourceTranscription landmark", () => {
  it("is a named region nested in the viewer, not a nested complementary landmark", () => {
    render(
      <PrimarySourceViewer source={SOURCE} title="Magna Carta">
        <PrimarySourceTranscription>
          <p>John, by the grace of God</p>
        </PrimarySourceTranscription>
      </PrimarySourceViewer>,
    );
    expect(
      screen.getByRole("region", { name: "Transcription" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });
});
