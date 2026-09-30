import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CodePlayground } from "./code-playground";

describe("CodePlayground", () => {
  it("renders the title and source content", () => {
    render(
      <CodePlayground title="Basic example">{`const greeting = "hi";`}</CodePlayground>,
    );
    expect(screen.getByText("Basic example")).toBeInTheDocument();
    expect(screen.getByText(/greeting/)).toBeInTheDocument();
  });

  it("renders the optional description and filename", () => {
    render(
      <CodePlayground
        description="Pan + zoom"
        filename="example.tsx"
        title="Demo"
      >
        const x = 1;
      </CodePlayground>,
    );
    expect(screen.getByText("Pan + zoom")).toBeInTheDocument();
    expect(screen.getByText("example.tsx")).toBeInTheDocument();
  });
});
