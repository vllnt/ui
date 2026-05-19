import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mdxComponents, TutorialMDX } from "./tutorial-mdx";

vi.mock("../flow-diagram", () => ({
  FlowDiagram: ({ title }: { title?: string }) => (
    <div data-testid="mock-flow-diagram">{title ?? "Flow diagram"}</div>
  ),
}));

describe("TutorialMDX", () => {
  it("renders plain markdown with styled headings, links, lists, and code", () => {
    const { container } = render(
      <TutorialMDX
        className="tutorial-copy"
        content={[
          "## Intro",
          "",
          "Read the [guide](https://example.com) and run `pnpm test`.",
          "",
          "- Learn",
          "- Verify",
        ].join("\n")}
      />,
    );

    expect(container.firstChild).toHaveClass("tutorial-copy");
    expect(screen.getByRole("heading", { name: "Intro" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "guide" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(screen.getByText("pnpm test")).toBeInTheDocument();
    expect(screen.getByText("Learn")).toBeInTheDocument();
    expect(screen.getByText("Verify")).toBeInTheDocument();
  });

  it("does not treat JSX-like text inside fenced code as MDX", () => {
    const { container } = render(
      <TutorialMDX content={"```tsx\n<Callout>Example</Callout>\n```"} />,
    );
    const codeBlock = container.querySelector("pre");
    if (!codeBlock) throw new Error("Expected fenced code block");

    expect(codeBlock).toHaveTextContent("<Callout>Example</Callout>");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders tutorial MDX components through the component map", async () => {
    await act(async () => {
      render(
        <TutorialMDX content='<Callout title="Heads up" variant="tip">Remember the flow.</Callout>' />,
      );
    });

    expect(await screen.findByRole("alert")).toHaveTextContent("Heads up");
    expect(screen.getByText("Remember the flow.")).toBeInTheDocument();
  });

  it("renders the lazy FlowDiagram mapping from MDX content", async () => {
    await act(async () => {
      render(
        <TutorialMDX content='<FlowDiagram title="Architecture map" nodes={[]} edges={[]} />' />,
      );
    });

    expect(await screen.findByTestId("mock-flow-diagram")).toHaveTextContent(
      "Architecture map",
    );
  });

  it("exports the expected tutorial component mappings", () => {
    expect(Object.keys(mdxComponents)).toEqual(
      expect.arrayContaining([
        "Callout",
        "FlowDiagram",
        "Quiz",
        "Step",
        "StepByStep",
      ]),
    );
  });
});
