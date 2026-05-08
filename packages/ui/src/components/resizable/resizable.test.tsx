import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable";

describe("ResizablePanelGroup", () => {
  it("renders panels and handles", () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <span>left-pane</span>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <span>right-pane</span>
        </ResizablePanel>
      </ResizablePanelGroup>,
    );

    expect(screen.getByText("left-pane")).toBeInTheDocument();
    expect(screen.getByText("right-pane")).toBeInTheDocument();
  });

  it("renders the handle with separator role by default", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <span>l</span>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <span>r</span>
        </ResizablePanel>
      </ResizablePanelGroup>,
    );

    expect(container.querySelector("[role='separator']")).toBeInTheDocument();
  });

  it("merges the className prop", () => {
    const { container } = render(
      <ResizablePanelGroup className="extra" direction="vertical">
        <ResizablePanel defaultSize={100}>
          <span>only</span>
        </ResizablePanel>
      </ResizablePanelGroup>,
    );

    expect(container.firstChild).toHaveClass("extra");
  });
});
