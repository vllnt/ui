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

const items = [
  {
    description: "Build form controls",
    id: "form",
    title: "Form",
  },
  {
    description: "Display user identity",
    id: "avatar",
    title: "Avatar",
  },
  {
    id: "badge",
    keywords: "status label",
    title: "Badge",
  },
];

function renderSearchDialog(
  props: Partial<Parameters<typeof SearchDialog>[0]> = {},
) {
  const onSelect = vi.fn();
  const view = render(
    <SearchDialog
      emptyText="Nothing found"
      groupHeading="Components"
      items={items}
      onSelect={onSelect}
      searchPlaceholder="Search components"
      {...props}
    />,
  );

  return { onSelect, ...view };
}

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

  describe("scope tabs", () => {
    function openWithTabs() {
      render(
        <SearchDialog
          docsSearch={vi.fn().mockResolvedValue([])}
          items={componentItems}
          onSelect={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /search/i }));

      return {
        components: screen.getByRole("tab", { name: "Components" }),
        docs: screen.getByRole("tab", { name: "Docs" }),
        everything: screen.getByRole("tab", { name: "Everything" }),
      };
    }

    it("keeps one tab stop, on the selected tab", () => {
      const { components, docs, everything } = openWithTabs();

      expect(components).toHaveAttribute("tabindex", "0");
      expect(docs).toHaveAttribute("tabindex", "-1");
      expect(everything).toHaveAttribute("tabindex", "-1");

      fireEvent.click(docs);

      expect(components).toHaveAttribute("tabindex", "-1");
      expect(docs).toHaveAttribute("tabindex", "0");
    });

    it("moves focus and selection with the arrow keys, Home and End", () => {
      const { components, docs, everything } = openWithTabs();
      components.focus();

      fireEvent.keyDown(components, { key: "ArrowRight" });
      expect(docs).toHaveFocus();
      expect(docs).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(docs, { key: "ArrowRight" });
      expect(everything).toHaveFocus();
      expect(everything).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(everything, { key: "ArrowRight" });
      expect(components).toHaveFocus();
      expect(components).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(components, { key: "ArrowLeft" });
      expect(everything).toHaveFocus();

      fireEvent.keyDown(everything, { key: "Home" });
      expect(components).toHaveFocus();

      fireEvent.keyDown(components, { key: "End" });
      expect(everything).toHaveFocus();
      expect(everything).toHaveAttribute("aria-selected", "true");
    });

    it("wires every tab to a tabpanel that holds the results and is named by the selected tab", () => {
      const { components, docs, everything } = openWithTabs();
      const panel = screen.getByRole("tabpanel");

      [components, docs, everything].forEach((tab) => {
        expect(tab).toHaveAttribute("aria-controls", panel.id);
      });
      expect(panel).toContainElement(screen.getByRole("listbox"));
      expect(panel).toHaveAccessibleName("Components");

      fireEvent.click(docs);

      expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Docs");
    });

    it("renders no tabs or tabpanel without docs search", () => {
      renderSearchDialog();
      fireEvent.click(screen.getByRole("button", { name: /search/i }));

      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
    });
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

  it("opens the command dialog from the trigger with items sorted by title and optional descriptions", () => {
    renderSearchDialog();
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search components"),
    ).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
    const avatar = screen.getByText("Avatar");
    const badge = screen.getByText("Badge");
    const form = screen.getByText("Form");

    expect(avatar.compareDocumentPosition(badge)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(badge.compareDocumentPosition(form)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByText("Display user identity")).toBeInTheDocument();
  });

  it("selects an item and closes the dialog", async () => {
    const { onSelect } = renderSearchDialog();

    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    fireEvent.click(screen.getByText("Avatar"));

    expect(onSelect).toHaveBeenCalledWith(items[1]);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("opens with the keyboard shortcut", () => {
    renderSearchDialog();

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows the shortcut on the trigger with the Kbd atom", () => {
    renderSearchDialog();

    const trigger = screen.getByRole("button", { name: /search/i });
    const hint = trigger.querySelector('[role="img"]');

    expect(hint).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^(Command|Ctrl) \+ K$/),
    );
    expect(hint?.querySelectorAll("kbd")).toHaveLength(2);
    expect(trigger.querySelector(":scope > kbd")).toBeNull();
  });

  it("ignores keyboard shortcuts from text inputs and when disabled", () => {
    const input = document.createElement("input");
    document.body.append(input);
    const { unmount } = renderSearchDialog();

    fireEvent.keyDown(input, { key: "k", metaKey: true });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    input.remove();
    unmount();

    renderSearchDialog({ enableKeyboardShortcut: false });
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("SearchDialog focus return", () => {
  it("returns focus to the search button after Escape", async () => {
    renderSearchDialog();
    const trigger = screen.getAllByRole("button")[0];
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
});
