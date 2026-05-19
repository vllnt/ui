import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchDialog, type SearchItem } from "./search-dialog";

const componentItems: SearchItem[] = [
  {
    description: "Accessible button primitive.",
    href: "/components/button",
    id: "button",
    title: "Button",
  },
];

describe("SearchDialog", () => {
  it("renders docs search scopes when docs search is configured", () => {
    render(
      <SearchDialog
        docsSearch={vi.fn()}
        items={componentItems}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(screen.getByRole("tab", { name: "Components" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Docs" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Everything" })).toBeInTheDocument();
  });

  it("searches docs and highlights matching snippet text", async () => {
    const documentationResult: SearchItem = {
      description: "/docs",
      href: "/docs",
      id: "docs:/docs",
      snippet: "Use dark mode themes in production.",
      title: "Documentation",
    };
    const documentationSearch = vi
      .fn()
      .mockResolvedValue([documentationResult]);
    const onDocumentationSelect = vi.fn();

    render(
      <SearchDialog
        docsSearch={documentationSearch}
        items={componentItems}
        onDocsSelect={onDocumentationSelect}
        onSelect={vi.fn()}
        searchPlaceholder="Search docs and components..."
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    fireEvent.click(screen.getByRole("tab", { name: "Docs" }));
    fireEvent.change(
      screen.getByPlaceholderText("Search docs and components..."),
      {
        target: { value: "dark" },
      },
    );

    await waitFor(() => {
      expect(documentationSearch).toHaveBeenCalledWith("dark");
    });

    await screen.findByText("Documentation");
    expect(screen.getByText("dark").tagName).toBe("MARK");

    fireEvent.click(screen.getByText("Documentation"));
    expect(onDocumentationSelect).toHaveBeenCalledWith(documentationResult);
  });
});
