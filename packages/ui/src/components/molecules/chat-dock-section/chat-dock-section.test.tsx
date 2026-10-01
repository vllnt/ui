import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ChatDockMessage, ChatDockSection } from "./chat-dock-section";

const sample: ChatDockMessage[] = [
  { body: "How do I retry a failed run?", id: "1", speaker: "Bea" },
  { body: "Click retry on the run row.", id: "2", speaker: "Assistant" },
];

describe("ChatDockSection", () => {
  it("renders each message with its speaker and the optional context label", () => {
    render(
      <ChatDockSection
        contextLabel="Spatial workspace"
        messages={sample}
        title="Helper"
      />,
    );
    expect(
      screen.getByText("How do I retry a failed run?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Click retry on the run row.")).toBeInTheDocument();
    expect(screen.getByText("Bea")).toBeInTheDocument();
    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getByText("Spatial workspace")).toBeInTheDocument();
  });

  it("falls back to the default title and composer placeholder", () => {
    render(<ChatDockSection messages={[]} />);
    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(
      screen.getByText("Ask about runs, errors, or pending work…"),
    ).toBeInTheDocument();
  });

  it("uses the override title and placeholder when provided", () => {
    render(
      <ChatDockSection
        composerPlaceholder="Type a question…"
        messages={[]}
        title="Helper"
      />,
    );
    expect(screen.getByText("Helper")).toBeInTheDocument();
    expect(screen.getByText("Type a question…")).toBeInTheDocument();
  });
});
