import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Terminal } from "./terminal";

const sampleLines = [
  { content: "install deps", type: "comment" } as const,
  { content: "pnpm install", type: "command" } as const,
  { content: "Done in 6.5s", type: "output" } as const,
];

describe("Terminal", () => {
  it("renders the title (default + override)", () => {
    const { rerender } = render(<Terminal lines={sampleLines} />);

    expect(screen.getByText("Terminal")).toBeInTheDocument();

    rerender(<Terminal lines={sampleLines} title="Logs" />);
    expect(screen.getByText("Logs")).toBeInTheDocument();
  });

  it("renders one row per line", () => {
    render(<Terminal lines={sampleLines} />);

    expect(screen.getByText("# install deps")).toBeInTheDocument();
    expect(screen.getByText("pnpm install")).toBeInTheDocument();
    expect(screen.getByText("Done in 6.5s")).toBeInTheDocument();
  });

  it("hides the copy button when copyable is false", () => {
    render(<Terminal copyable={false} lines={sampleLines} />);

    expect(screen.queryByLabelText(/copy/i)).not.toBeInTheDocument();
  });
});
