import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CodePlayground } from "./code-playground";

describe("CodePlayground", () => {
  it("renders the title", () => {
    render(<CodePlayground title="Basic example">const x = 1;</CodePlayground>);

    expect(screen.getByText("Basic example")).toBeInTheDocument();
  });

  it("renders the optional description", () => {
    render(
      <CodePlayground description="Pan + zoom" title="Demo">
        const x = 1;
      </CodePlayground>,
    );

    expect(screen.getByText("Pan + zoom")).toBeInTheDocument();
  });

  it("renders the optional filename", () => {
    render(
      <CodePlayground filename="example.tsx" title="Demo">
        const x = 1;
      </CodePlayground>,
    );

    expect(screen.getByText("example.tsx")).toBeInTheDocument();
  });

  it("renders the source content", () => {
    render(
      <CodePlayground title="Demo">{`const greeting = "hi";`}</CodePlayground>,
    );

    expect(screen.getByText(/greeting/)).toBeInTheDocument();
  });
});
