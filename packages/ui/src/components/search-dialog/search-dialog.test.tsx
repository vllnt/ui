import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchDialog } from "./search-dialog";

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
  it("opens the command dialog from the trigger", () => {
    renderSearchDialog();

    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search components"),
    ).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
  });

  it("sorts items by title and renders optional descriptions", () => {
    renderSearchDialog();

    fireEvent.click(screen.getByRole("button", { name: /search/i }));

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
