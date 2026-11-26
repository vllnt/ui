import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TutorialIntroContent } from "./tutorial-intro-content";

const markdownParser = vi.hoisted(() => ({ loads: 0 }));

vi.mock("react-markdown", async (importOriginal) => {
  markdownParser.loads += 1;
  return importOriginal();
});

describe("TutorialIntroContent", () => {
  it("loads the markdown parser on demand and shows the text meanwhile", async () => {
    expect(markdownParser.loads).toBe(0);
    render(
      <TutorialIntroContent
        content="Intro paragraph with **strong text**."
        title="Start here"
      />,
    );
    expect(screen.getByText(/Intro paragraph with/)).toBeInTheDocument();
    expect(screen.queryByText("strong text")).not.toBeInTheDocument();
    expect(await screen.findByText("strong text")).toBeInTheDocument();
    expect(markdownParser.loads).toBe(1);
  });

  it("renders the supplied title and markdown content", async () => {
    render(
      <TutorialIntroContent
        content="Intro paragraph with **strong text**."
        title="Start here"
      />,
    );
    expect(screen.getByRole("heading", { name: "Start here" })).toBeVisible();
    expect(await screen.findByText("strong text")).toHaveClass("font-semibold");
    expect(screen.getByText(/Intro paragraph with/)).toBeInTheDocument();
  });

  it("renders links and inline code with the expected semantics", async () => {
    render(
      <TutorialIntroContent
        content="Use [`pnpm`](https://pnpm.io) for installs."
        title="Setup"
      />,
    );
    const code = await screen.findByText("pnpm");
    expect(code.tagName).toBe("CODE");
    expect(code.closest("a")).toHaveAttribute("href", "https://pnpm.io");
  });

  it("strips MDX component tags before markdown rendering", async () => {
    render(
      <TutorialIntroContent
        content={[
          "Visible copy.",
          "<Callout>Hidden client-only content</Callout>",
          "<Badge />",
        ].join("\n\n")}
        title="Hybrid content"
      />,
    );
    expect(await screen.findByText("Visible copy.")).toBeInTheDocument();
    expect(
      screen.queryByText("Hidden client-only content"),
    ).not.toBeInTheDocument();
  });

  it("applies a custom class name to the section", () => {
    const { container } = render(
      <TutorialIntroContent
        className="custom-intro"
        content="Body"
        title="Intro"
      />,
    );
    expect(container.querySelector("section")).toHaveClass("custom-intro");
  });
});
