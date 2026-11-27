import { render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MDXContent } from "./mdx-content";

const compiler = vi.hoisted(() => ({ loads: 0 }));

vi.mock("@mdx-js/mdx", async (importOriginal) => {
  compiler.loads += 1;
  return importOriginal();
});

function Note({ children }: { children: React.ReactNode }) {
  return <aside>{children}</aside>;
}

describe("MDXContent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not load the MDX compiler for plain markdown", async () => {
    render(await MDXContent({ content: "## Plain\n\nNo components here." }));

    expect(screen.getByRole("heading", { name: "Plain" })).toBeInTheDocument();
    expect(compiler.loads).toBe(0);
  });

  it("loads the MDX compiler once for content with components", async () => {
    render(
      await MDXContent({
        components: { Note },
        content: "<Note>Compiled content</Note>",
      }),
    );
    render(
      await MDXContent({
        components: { Note },
        content: "<Note>Compiled again</Note>",
      }),
    );

    expect(screen.getByText("Compiled content")).toBeInTheDocument();
    expect(screen.getByText("Compiled again")).toBeInTheDocument();
    expect(compiler.loads).toBe(1);
  });

  it("renders GFM pipe tables as accessible tables", async () => {
    const content = [
      "| Name | Status |",
      "| --- | --- |",
      "| Design | Ready |",
    ].join("\n");

    render(await MDXContent({ content, enableMDX: false }));

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Name" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Status" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Design" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ready" })).toBeInTheDocument();
  });

  it("renders markdown headings, links, and list items", async () => {
    const node = await MDXContent({
      content:
        "## Getting started\n\nRead the [docs](https://example.com).\n\n- Install\n- Ship",
    });

    render(node);

    expect(
      screen.getByRole("heading", { name: "Getting started" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(screen.getByText("Install")).toBeInTheDocument();
    expect(screen.getByText("Ship")).toBeInTheDocument();
  });

  it("strips injected component imports before rendering MDX", async () => {
    const node = await MDXContent({
      components: { Note },
      content:
        'import { Note } from "./note";\n\n<Note>Imported component content</Note>',
    });

    render(node);

    expect(screen.getByText("Imported component content")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(
      'import { Note } from "./note"',
    );
  });

  it("strips long import lines without regex backtracking or interpreting names", async () => {
    const node = await MDXContent({
      components: { "[": Note, Note },
      content: [
        `import ${" ".repeat(20_000)}CodeBlock${"CodeBlock".repeat(2000)} from "./code";`,
        'import { [ } from "./literal-name";',
        "",
        "## Content remains",
        "",
        "<Note>Imported note</Note>",
      ].join("\n"),
    });

    render(node);
    expect(
      screen.getByRole("heading", { name: "Content remains" }),
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("import");
  });

  it("falls back to markdown when MDX evaluation fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => null);
    const node = await MDXContent({
      content: "## Fallback content\n\n<Broken",
    });

    render(node);

    expect(
      screen.getByRole("heading", { name: "Fallback content" }),
    ).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "Error rendering MDX:",
      expect.any(Error),
    );
  });
});
