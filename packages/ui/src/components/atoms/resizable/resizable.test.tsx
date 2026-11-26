import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable";

describe("ResizablePanelGroup", () => {
  it("renders panels and a handle with separator role by default", () => {
    const { container } = render(
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

  it.each(["horizontal", "vertical"] as const)(
    "lays panels out in the %s direction",
    (direction) => {
      const { container } = render(
        <ResizablePanelGroup direction={direction}>
          <ResizablePanel defaultSize={50}>one</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>two</ResizablePanel>
        </ResizablePanelGroup>,
      );
      expect(container.firstChild).toHaveAttribute(
        "data-orientation",
        direction,
      );
      expect(screen.getByRole("separator")).toHaveAttribute(
        "aria-orientation",
        // A vertical separator splits panels side by side.
        direction === "horizontal" ? "vertical" : "horizontal",
      );
    },
  );

  it("takes orientation as well as direction", () => {
    const { container } = render(
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize={100}>one</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(container.firstChild).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  it("sizes panels from defaultSize, in percent", () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30}>one</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={70}>two</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByText("one").getAttribute("style")).toContain("30%");
    expect(screen.getByText("two").getAttribute("style")).toContain("70%");
  });
});

describe("ResizablePanel", () => {
  it("merges the className prop", () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className="panel-extra" defaultSize={100}>
          <span>pane</span>
        </ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByText("pane").closest(".panel-extra")).toHaveClass(
      "overflow-auto",
    );
  });
});

describe("ResizableHandle", () => {
  const renderHandle = (props = {}) =>
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>one</ResizablePanel>
        <ResizableHandle {...props} />
        <ResizablePanel defaultSize={50}>two</ResizablePanel>
      </ResizablePanelGroup>,
    );

  it("has a name, and keeps a consumer's", () => {
    const { unmount } = renderHandle();
    expect(screen.getByRole("separator", { name: "Resize" })).toBeVisible();
    unmount();

    renderHandle({ "aria-label": "Resize sidebar" });
    expect(
      screen.getByRole("separator", { name: "Resize sidebar" }),
    ).toBeVisible();
  });

  it("shows a grip only with withHandle", () => {
    const { container, unmount } = renderHandle();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    unmount();

    const { container: withGrip } = renderHandle({ withHandle: true });
    expect(withGrip.querySelector("[role=separator] svg")).toBeInTheDocument();
  });

  it("merges the className prop", () => {
    renderHandle({ className: "handle-extra" });
    expect(screen.getByRole("separator")).toHaveClass("handle-extra");
  });
});
