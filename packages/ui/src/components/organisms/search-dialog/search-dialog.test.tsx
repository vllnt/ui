import {
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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

  it.each([
    ["Cmd+K", { metaKey: true }],
    ["Ctrl+K", { ctrlKey: true }],
  ])("opens with %s", async (_name, modifier) => {
    renderSearchDialog();

    fireEvent.keyDown(document.body, { key: "k", ...modifier });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("leaves other key combinations alone", () => {
    renderSearchDialog();

    fireEvent.keyDown(document.body, { key: "k" });
    fireEvent.keyDown(document.body, { key: "j", metaKey: true });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
    input.focus();
    const { unmount } = renderSearchDialog();

    const typed = createEvent.keyDown(input, { key: "k", metaKey: true });
    fireEvent(input, typed);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // The field keeps its own Cmd+K: the search does not claim the key.
    expect(typed.defaultPrevented).toBe(false);
    input.remove();
    unmount();

    renderSearchDialog({ enableKeyboardShortcut: false });
    fireEvent.keyDown(document.body, { key: "k", metaKey: true });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("SearchDialog docs search", () => {
  const placeholder = "Search docs and components...";

  function openDocumentationSearch(
    documentationSearch: (query: string) => Promise<SearchItem[]>,
    props: Partial<Parameters<typeof SearchDialog>[0]> = {},
  ) {
    render(
      <SearchDialog
        docsSearch={documentationSearch}
        items={componentItems}
        onSelect={vi.fn()}
        searchPlaceholder={placeholder}
        {...props}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    fireEvent.click(screen.getByRole("tab", { name: "Docs" }));

    return (value: string) => {
      fireEvent.change(screen.getByPlaceholderText(placeholder), {
        target: { value },
      });
    };
  }

  it("does not search below the minimum query length", async () => {
    const documentationSearch = vi.fn().mockResolvedValue([]);
    const type = openDocumentationSearch(documentationSearch);

    type("d");
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });

    expect(documentationSearch).not.toHaveBeenCalled();
  });

  it("honours minDocsSearchLength", async () => {
    const documentationSearch = vi.fn().mockResolvedValue([]);
    const type = openDocumentationSearch(documentationSearch, {
      minDocsSearchLength: 4,
    });

    type("dar");
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    expect(documentationSearch).not.toHaveBeenCalled();

    type("dark");
    await waitFor(() => {
      expect(documentationSearch).toHaveBeenCalledWith("dark");
    });
  });

  it("shows no results when the search rejects", async () => {
    const documentationSearch = vi.fn().mockRejectedValue(new Error("offline"));
    const type = openDocumentationSearch(documentationSearch, {
      docsEmptyText: "No docs",
    });

    type("dark");

    expect(await screen.findByText("No docs")).toBeInTheDocument();
  });

  it("shows the loading text while the search runs, then the results", async () => {
    const resolvers: ((items: SearchItem[]) => void)[] = [];
    const documentationSearch = vi.fn().mockImplementation(
      () =>
        new Promise<SearchItem[]>((done) => {
          resolvers.push(done);
        }),
    );
    const type = openDocumentationSearch(documentationSearch);

    type("dark");
    expect(await screen.findByText("Searching docs...")).toBeInTheDocument();

    resolvers[0]?.([{ id: "docs:/dark", title: "Dark mode" }]);

    expect(await screen.findByText("Dark mode")).toBeInTheDocument();
    expect(screen.queryByText("Searching docs...")).not.toBeInTheDocument();
  });

  it("keeps the answer to the latest query when an older one arrives late", async () => {
    const pending = new Map<string, (items: SearchItem[]) => void>();
    const documentationSearch = vi.fn().mockImplementation(
      (query: string) =>
        new Promise<SearchItem[]>((done) => {
          pending.set(query, done);
        }),
    );
    const type = openDocumentationSearch(documentationSearch);

    type("dark");
    await waitFor(() => {
      expect(documentationSearch).toHaveBeenCalledWith("dark");
    });
    type("light");
    await waitFor(() => {
      expect(documentationSearch).toHaveBeenCalledWith("light");
    });

    pending.get("light")?.([{ id: "docs:/light", title: "Light theme" }]);
    expect(await screen.findByText("Light theme")).toBeInTheDocument();
    pending.get("dark")?.([{ id: "docs:/dark", title: "Dark theme" }]);
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });

    expect(screen.queryByText("Dark theme")).not.toBeInTheDocument();
    expect(screen.getByText("Light theme")).toBeInTheDocument();
  });

  it("drops the docs results when the scope goes back to components", async () => {
    const documentationSearch = vi
      .fn()
      .mockResolvedValue([{ id: "docs:/dark", title: "Dark mode" }]);
    const type = openDocumentationSearch(documentationSearch);

    type("dark");
    expect(await screen.findByText("Dark mode")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Components" }));

    expect(screen.queryByText("Dark mode")).not.toBeInTheDocument();
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
