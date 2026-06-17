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
  describe("rendering", () => {
    it("renders all slots with their content", () => {
      render(
        <Panel>
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
    });

    it("applies custom className to the container", () => {
      const { container } = render(
        <Panel className="custom-class">content</Panel>,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("ref", () => {
    it("forwards a ref to the container", () => {
      let node: HTMLDivElement | null = null;
      render(
        <Panel
          ref={(element) => {
            node = element;
          }}
        >
          content
        </Panel>,
      );

      expect(node).toBeInstanceOf(HTMLDivElement);
    });
  });
});
