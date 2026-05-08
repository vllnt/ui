import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type PropertyEntry, PropertySection } from "./property-section";

const ENTRIES: PropertyEntry[] = [
  { id: "x", label: "X", value: "120" },
  { id: "y", label: "Y", value: "80" },
  {
    id: "size",
    label: "Size",
    sublabel: "px",
    value: "240 × 120",
  },
];

describe("PropertySection", () => {
  it("renders one row per entry", () => {
    const { container } = render(<PropertySection entries={ENTRIES} />);

    expect(
      container.querySelector("[data-property-id='x']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-property-id='y']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-property-id='size']"),
    ).toBeInTheDocument();
  });

  it("renders the value in the right column", () => {
    render(<PropertySection entries={ENTRIES} />);

    expect(screen.getByText("240 × 120")).toBeInTheDocument();
  });

  it("renders the title as a header by default", () => {
    const { container } = render(
      <PropertySection entries={ENTRIES} title="Layout" />,
    );

    expect(container.querySelector("[data-property-header]")).toHaveTextContent(
      "Layout",
    );
  });

  it("renders the title as a collapsible summary when collapsible is true", () => {
    const { container } = render(
      <PropertySection collapsible entries={ENTRIES} title="Layout" />,
    );

    expect(
      container.querySelector("[data-property-summary]"),
    ).toBeInTheDocument();
    expect(container.querySelector("details")).toHaveAttribute("open");
  });

  it("renders the sublabel when set", () => {
    render(<PropertySection entries={ENTRIES} />);

    expect(screen.getByText("px")).toBeInTheDocument();
  });
});
