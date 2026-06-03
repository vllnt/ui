import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TutorialIntroContent } from "./tutorial-intro-content";

describe("TutorialIntroContent", () => {
  it("renders the supplied title and markdown content", () => {
    render(
      <TutorialIntroContent
        content="Intro paragraph with **strong text**."
        title="Start here"
      />,
    );

    expect(screen.getByRole("heading", { name: "Start here" })).toBeVisible();
    expect(screen.getByText(/Intro paragraph with/)).toBeInTheDocument();
    expect(screen.getByText("strong text")).toHaveClass("font-semibold");
  });

  it("renders links and inline code with the expected semantics", () => {
    render(
      <TutorialIntroContent
        content="Use [`pnpm`](https://pnpm.io) for installs."
        title="Setup"
      />,
    );

    expect(screen.getByText("pnpm").tagName).toBe("CODE");
    expect(screen.getByText("pnpm").closest("a")).toHaveAttribute(
      "href",
      "https://pnpm.io",
    );
  });

  it("strips MDX component tags before markdown rendering", () => {
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

    expect(screen.getByText("Visible copy.")).toBeInTheDocument();
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
