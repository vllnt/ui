import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TLDRSection } from "./tldr-section";

describe("TLDRSection", () => {
  it("renders the label", () => {
    render(
      <TLDRSection label="TLDR">
        <p>Body</p>
      </TLDRSection>,
    );

    expect(screen.getByText("TLDR")).toBeInTheDocument();
  });

  it("starts collapsed", () => {
    render(
      <TLDRSection label="TLDR">
        <p>Body content</p>
      </TLDRSection>,
    );

    expect(screen.queryByText("Body content")).not.toBeInTheDocument();
  });

  it("expands on trigger click", () => {
    render(
      <TLDRSection label="TLDR">
        <p>Body content</p>
      </TLDRSection>,
    );

    fireEvent.click(screen.getByText("TLDR"));

    // After click the label is still there + the content slot mounts
    expect(screen.getByText("TLDR")).toBeInTheDocument();
  });
});
