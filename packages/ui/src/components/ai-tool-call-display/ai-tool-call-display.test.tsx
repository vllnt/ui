import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AIToolCallDisplay } from "./ai-tool-call-display";

describe("AIToolCallDisplay", () => {
  it("renders tool metadata and merges className", () => {
    const { container } = render(
      <AIToolCallDisplay
        className="custom-class"
        description="Checked the latest CI run for failures."
        status="running"
        toolName="ci.inspect"
      />,
    );
    expect(screen.getByText("ci.inspect")).toBeVisible();
    expect(screen.getByText("running")).toBeVisible();
    expect(
      screen.getByText("Checked the latest CI run for failures."),
    ).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders collapsible input and output sections", () => {
    render(
      <AIToolCallDisplay
        input='{"suite":"ui"}'
        output='{"status":"ok"}'
        toolName="tests.run"
      />,
    );
    expect(screen.getByText("Tool input")).toBeVisible();
    expect(screen.getByText('{"suite":"ui"}')).toBeVisible();
    expect(screen.getByText('{"status":"ok"}')).toBeVisible();
  });
});
