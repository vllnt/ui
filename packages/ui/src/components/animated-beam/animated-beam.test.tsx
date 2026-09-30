import * as React from "react";

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { AnimatedBeam } from "./animated-beam";

class ResizeObserverStub {
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();
}

describe("AnimatedBeam", () => {
  beforeEach(() => {
    stubMatchMedia();
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  });

  it("renders an svg without crashing on null refs", () => {
    const containerRef = React.createRef<HTMLElement>();
    const fromRef = React.createRef<HTMLElement>();
    const toRef = React.createRef<HTMLElement>();
    const { container } = render(
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef}
        toRef={toRef}
      />,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies a custom class name with wired refs", () => {
    const Harness = (): React.ReactElement => {
      const containerRef = React.useRef<HTMLDivElement>(null);
      const fromRef = React.useRef<HTMLDivElement>(null);
      const toRef = React.useRef<HTMLDivElement>(null);

      return (
        <div ref={containerRef}>
          <span ref={fromRef}>from</span>
          <span ref={toRef}>to</span>
          <AnimatedBeam
            className="custom-class"
            containerRef={containerRef}
            fromRef={fromRef}
            toRef={toRef}
          />
        </div>
      );
    };

    const { container } = render(<Harness />);

    expect(container.querySelector("svg")).toHaveClass("custom-class");
  });
});
