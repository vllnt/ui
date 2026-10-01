import { StrictMode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubAnimationFrame } from "../../../__tests__/stub-animation-frame";
import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { Dock, DockIcon } from "./dock";

function iconBounds(left: number): DOMRect {
  return {
    bottom: 48,
    height: 48,
    left,
    right: left + 48,
    toJSON: () => ({}),
    top: 0,
    width: 48,
    x: left,
    y: 0,
  };
}

function movePointer(target: HTMLElement, clientX: number): void {
  fireEvent(target, new MouseEvent("pointermove", { bubbles: true, clientX }));
}

function renderDock(iconStyle?: React.CSSProperties) {
  render(
    <Dock data-testid="dock">
      <DockIcon style={iconStyle}>Home</DockIcon>
    </Dock>,
  );
  const icon = screen.getByText("Home");
  const bounds = vi
    .spyOn(icon, "getBoundingClientRect")
    .mockReturnValue(iconBounds(100));
  return { bounds, dock: screen.getByTestId("dock"), icon };
}

describe("Dock", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders its icons and applies custom class names to Dock and DockIcon", () => {
    const { container } = render(
      <Dock className="dock-class">
        <DockIcon className="icon-class">Home</DockIcon>
      </Dock>,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("dock-class");
    expect(container.querySelector(".icon-class")).toHaveTextContent("Home");
  });

  it("magnifies the icon under the pointer on the next frame and resets on leave", () => {
    const frames = stubAnimationFrame();
    const { dock, icon } = renderDock();
    frames.flush();
    expect(icon.style.transform).toBe("scale(1)");

    movePointer(dock, 124);
    expect(icon.style.transform).toBe("scale(1)");
    frames.flush();
    expect(icon.style.transform).toBe("scale(1.5)");

    fireEvent.pointerLeave(dock);
    frames.flush();
    expect(icon.style.transform).toBe("scale(1)");
  });

  it("reads icon bounds once per frame however many pointer moves arrive", () => {
    const frames = stubAnimationFrame();
    const { bounds, dock, icon } = renderDock();
    frames.flush();
    bounds.mockClear();

    movePointer(dock, 0);
    movePointer(dock, 50);
    movePointer(dock, 174);
    expect(frames.pending()).toBe(1);
    frames.flush();

    expect(bounds).toHaveBeenCalledTimes(1);
    expect(icon.style.transform).toBe("scale(1.25)");
  });

  it("keeps icons at rest size under reduced motion", () => {
    stubMatchMedia(true);
    const frames = stubAnimationFrame();
    const { bounds, dock, icon } = renderDock();

    movePointer(dock, 124);
    frames.flush();

    expect(icon.style.transform).toBe("scale(1)");
    expect(bounds).not.toHaveBeenCalled();
  });

  it("keeps a transform passed through the icon style", () => {
    const frames = stubAnimationFrame();
    const { dock, icon } = renderDock({ transform: "rotate(5deg)" });

    movePointer(dock, 124);
    frames.flush();

    expect(icon.style.transform).toBe("rotate(5deg)");
  });
});

describe("Dock lifecycle", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("magnifies under StrictMode, where effects mount twice", () => {
    const frames = stubAnimationFrame();
    render(
      <StrictMode>
        <Dock data-testid="dock">
          <DockIcon>Home</DockIcon>
        </Dock>
      </StrictMode>,
    );
    const icon = screen.getByText("Home");
    vi.spyOn(icon, "getBoundingClientRect").mockReturnValue(iconBounds(100));
    frames.flush();

    movePointer(screen.getByTestId("dock"), 124);
    frames.flush();

    expect(icon.style.transform).toBe("scale(1.5)");
  });
});
