import { render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MDXContent } from "./mdx-content";

function Note({ children }: { children: React.ReactNode }) {
  return <aside>{children}</aside>;
}

describe("MDXContent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
