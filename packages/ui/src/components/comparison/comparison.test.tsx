import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BeforeAfter, Comparison } from "./comparison";

describe("Comparison", () => {
  it("renders both sides with their titles + items", () => {
    render(
      <Comparison
        after={{ items: ["c", "d"], title: "After", variant: "good" }}
        before={{ items: ["a", "b"], title: "Before", variant: "bad" }}
      />,
    );

    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("d")).toBeInTheDocument();
  });

  it("renders the optional title", () => {
    render(
      <Comparison
        after={{ items: ["c"], title: "A", variant: "good" }}
        before={{ items: ["a"], title: "B", variant: "bad" }}
        title="Comparison"
      />,
    );

    expect(screen.getByText("Comparison")).toBeInTheDocument();
  });

  it("falls back to default variants when not specified", () => {
    render(
      <Comparison
        after={{ items: ["x"], title: "After" }}
        before={{ items: ["y"], title: "Before" }}
      />,
    );

    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
  });
});

describe("BeforeAfter", () => {
  it("renders both slots and the optional title", () => {
    render(
      <BeforeAfter
        after={<span>after-slot</span>}
        before={<span>before-slot</span>}
        title="Refactor"
      />,
    );

    expect(screen.getByText("before-slot")).toBeInTheDocument();
    expect(screen.getByText("after-slot")).toBeInTheDocument();
    expect(screen.getByText("Refactor")).toBeInTheDocument();
  });

  it("renders without a title", () => {
    render(
      <BeforeAfter
        after={<span>after-slot</span>}
        before={<span>before-slot</span>}
      />,
    );

    expect(screen.getByText("before-slot")).toBeInTheDocument();
  });
});
