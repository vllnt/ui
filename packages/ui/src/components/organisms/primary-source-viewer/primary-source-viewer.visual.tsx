import { expect, test } from "@playwright/experimental-ct-react";

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

test.describe("PrimarySourceViewer Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <PrimarySourceViewer
        origin="England"
        period="Medieval"
        source={{
          alt: "Historical document",
          src: "https://placehold.co/800x500/0d1117/d0d0d0/png?text=Primary+Source",
          type: "image",
        }}
        title="Magna Carta (1215)"
      >
        <PrimarySourceToolbar>
          <PrimarySourceZoomIn />
          <PrimarySourceZoomOut />
          <PrimarySourceRotate />
        </PrimarySourceToolbar>
        <PrimarySourceAnnotations>
          <PrimarySourceAnnotation
            category="Artifact"
            color="amber"
            id="seal"
            note="Royal seal of King John"
            region={{ height: 12, width: 28, x: 14, y: 60 }}
          />
          <PrimarySourceAnnotation
            category="Clause"
            color="blue"
            id="clause-39"
            note="Clause 39 — Habeas corpus precursor"
            region={{ height: 10, width: 50, x: 30, y: 35 }}
          />
        </PrimarySourceAnnotations>
        <PrimarySourceTranscription>
          <p>John, by the grace of God, King of England&hellip;</p>
        </PrimarySourceTranscription>
        <PrimarySourceContext>
          <PrimarySourceMetadata>
            <dt>Date</dt>
            <dd>June 15, 1215</dd>
            <dt>Location</dt>
            <dd>Runnymede, England</dd>
          </PrimarySourceMetadata>
          <PrimarySourceQuestions>
            <p>1. What rights does this document establish?</p>
            <p>2. Why was it significant for its time?</p>
          </PrimarySourceQuestions>
        </PrimarySourceContext>
      </PrimarySourceViewer>,
    );
    await expect(component).toHaveScreenshot(
      "primary-source-viewer-default.png",
    );
  });
});
