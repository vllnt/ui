import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Panel,
  PanelBody,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "./panel";

describe("Panel", () => {
  it("renders all slots in a container that merges className and forwards ref", () => {
    let node: HTMLDivElement | null = null;
    const { container } = render(
      <Panel
        className="custom-class"
        ref={(element) => {
          node = element;
        }}
      >
        <PanelHeader>
          <PanelTitle>Title</PanelTitle>
          <PanelDescription>Description</PanelDescription>
        </PanelHeader>
        <PanelBody>Body</PanelBody>
        <PanelFooter>Footer</PanelFooter>
      </Panel>,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(node).toBeInstanceOf(HTMLDivElement);
  });
});
