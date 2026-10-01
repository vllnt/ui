import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Slideshow, type SlideshowProps } from "./slideshow";

const sections = [
  { id: "intro", title: "Intro" },
  { id: "setup", title: "Setup" },
  { id: "finish", title: "Finish" },
];

function renderSlideshow(overrides: Partial<SlideshowProps> = {}) {
  const props = {
    completedSections: new Set<string>(),
    currentIndex: 0,
    onComplete: vi.fn(),
    onExit: vi.fn(),
    onNavigate: vi.fn(),
    onToggleSection: vi.fn(),
    renderContent: (section: { title: string }) => (
      <article>{section.title} body</article>
    ),
    sections,
    title: "Tutorial",
    ...overrides,
  };

  const view = render(<Slideshow {...props} />);

  return { props, view };
}

function advanceNavigationTimer() {
  act(() => {
    vi.advanceTimersByTime(150);
  });
}

describe("Slideshow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = "";
  });

  it("renders in a portal and restores body scroll lock on cleanup", () => {
    const { view } = renderSlideshow();
    expect(screen.getByText("Tutorial")).toBeInTheDocument();
    expect(screen.getByText("Intro body")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    view.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("opens the completion dialog before navigating an incomplete section", () => {
    const { props } = renderSlideshow();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(
      screen.getByRole("dialog", { name: "Mark section as complete?" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^done/i }));
    advanceNavigationTimer();
    expect(props.onToggleSection).toHaveBeenCalledWith("intro");
    expect(props.onNavigate).toHaveBeenCalledWith(1);
  });

  it("navigates from the table of contents after the transition delay", () => {
    const { props } = renderSlideshow();
    fireEvent.click(
      screen.getByRole("button", { name: "Open table of contents" }),
    );
    // Clicks and keys inside the panel must not close it.
    fireEvent.click(screen.getByRole("dialog"));
    fireEvent.keyDown(screen.getByRole("button", { name: "Setup" }), {
      key: "Enter",
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Setup" }));
    advanceNavigationTimer();
    expect(props.onNavigate).toHaveBeenCalledWith(1);
    expect(
      screen.getByRole("button", { name: "Open table of contents" }),
    ).toBeInTheDocument();
  });

  it("handles keyboard exit and next navigation shortcuts", () => {
    const { props } = renderSlideshow({
      completedSections: new Set(["intro"]),
    });
    fireEvent.keyDown(document, { key: "ArrowRight" });
    advanceNavigationTimer();
    expect(props.onNavigate).toHaveBeenCalledWith(1);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(props.onExit).toHaveBeenCalledTimes(1);
  });
});

describe("Slideshow navigation timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = "";
  });

  it("keeps the latest navigation when the user clicks again during the transition", () => {
    const { props } = renderSlideshow({
      completedSections: new Set(["intro", "setup", "finish"]),
      currentIndex: 1,
    });

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /prev/i }));
    advanceNavigationTimer();

    expect(props.onNavigate).toHaveBeenCalledTimes(1);
    expect(props.onNavigate).toHaveBeenCalledWith(0);
  });

  it("drops a pending navigation when the slideshow unmounts", () => {
    const { props, view } = renderSlideshow({
      completedSections: new Set(["intro"]),
    });

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    view.unmount();
    advanceNavigationTimer();

    expect(props.onNavigate).not.toHaveBeenCalled();
  });
});
