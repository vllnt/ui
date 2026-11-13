import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TagGroup, TagGroupItem, type TagGroupLabels } from "./tag-group";

describe("TagGroup", () => {
  it("renders tags inside a labelled group", () => {
    const { getByRole, getByText } = render(
      <TagGroup label="Filters">
        <TagGroupItem value="a">Alpha</TagGroupItem>
        <TagGroupItem value="b">Beta</TagGroupItem>
      </TagGroup>,
    );
    expect(getByRole("group", { name: "Filters" })).toBeInTheDocument();
    expect(getByText("Alpha")).toBeInTheDocument();
  });

  it("toggles selection in multiple mode", () => {
    const onValueChange = vi.fn();
    const { getByText } = render(
      <TagGroup onValueChange={onValueChange} selectionMode="multiple">
        <TagGroupItem value="a">Alpha</TagGroupItem>
        <TagGroupItem value="b">Beta</TagGroupItem>
      </TagGroup>,
    );
    fireEvent.click(getByText("Alpha"));
    expect(onValueChange).toHaveBeenCalledWith(["a"]);
  });

  it("replaces selection in single mode", () => {
    const onValueChange = vi.fn();
    const { getByText } = render(
      <TagGroup
        defaultValue={["a"]}
        onValueChange={onValueChange}
        selectionMode="single"
      >
        <TagGroupItem value="a">Alpha</TagGroupItem>
        <TagGroupItem value="b">Beta</TagGroupItem>
      </TagGroup>,
    );
    fireEvent.click(getByText("Beta"));
    expect(onValueChange).toHaveBeenCalledWith(["b"]);
  });

  it("calls onRemove when the remove button is clicked", () => {
    const onRemove = vi.fn();
    const { getByLabelText } = render(
      <TagGroup>
        <TagGroupItem onRemove={onRemove} value="a">
          Alpha
        </TagGroupItem>
      </TagGroup>,
    );
    fireEvent.click(getByLabelText("Remove a"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe("TagGroup remove button", () => {
  it("is a real button named Remove <tag> with a 24 px hit area", () => {
    const { getByRole } = render(
      <TagGroup label="Filters">
        <TagGroupItem onRemove={vi.fn()} value="alpha">
          Alpha
        </TagGroupItem>
      </TagGroup>,
    );
    const remove = getByRole("button", { name: "Remove alpha" });

    expect(remove.tagName).toBe("BUTTON");
    expect(remove).toHaveAttribute("type", "button");
    expect(remove).toHaveClass(
      "size-6",
      "focus-visible:ring-2",
      "focus-visible:ring-inset",
    );
  });

  it("names each remove button after its own tag", () => {
    const { getAllByRole } = render(
      <TagGroup>
        <TagGroupItem onRemove={vi.fn()} value="a">
          Alpha
        </TagGroupItem>
        <TagGroupItem onRemove={vi.fn()} value="b">
          Beta
        </TagGroupItem>
      </TagGroup>,
    );

    expect(
      getAllByRole("button").map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Remove a", "Remove b"]);
  });

  it("uses labels.remove for the accessible name", () => {
    const remove = vi.fn((tag: string) => `Supprimer ${tag}`);
    const { getByRole, queryByRole } = render(
      <TagGroup labels={{ remove }}>
        <TagGroupItem onRemove={vi.fn()} value="a">
          Alpha
        </TagGroupItem>
      </TagGroup>,
    );

    expect(getByRole("button", { name: "Supprimer a" })).toHaveClass("size-6");
    expect(queryByRole("button", { name: "Remove a" })).toBeNull();
    expect(remove).toHaveBeenCalledWith("a");
  });

  it.each<[string, TagGroupLabels]>([
    ["an empty labels object", {}],
    ["an undefined remove label", { remove: undefined }],
  ])("falls back to Remove <tag> for %s", (_case, labels) => {
    const { getByRole } = render(
      <TagGroup labels={labels}>
        <TagGroupItem onRemove={vi.fn()} value="a">
          Alpha
        </TagGroupItem>
      </TagGroup>,
    );

    expect(getByRole("button", { name: "Remove a" })).toBeInTheDocument();
  });

  it("renders no remove button without onRemove", () => {
    const { queryAllByRole } = render(
      <TagGroup>
        <TagGroupItem value="a">Alpha</TagGroupItem>
      </TagGroup>,
    );

    expect(queryAllByRole("button")).toHaveLength(0);
  });

  it("renders an empty group without buttons", () => {
    const { getByRole, queryAllByRole } = render(
      <TagGroup label="Filters">{null}</TagGroup>,
    );

    expect(getByRole("group", { name: "Filters" })).toBeEmptyDOMElement();
    expect(queryAllByRole("button")).toHaveLength(0);
  });

  it("disables the remove button with the group", () => {
    const onRemove = vi.fn();
    const { getByRole } = render(
      <TagGroup disabled>
        <TagGroupItem onRemove={onRemove} value="a">
          Alpha
        </TagGroupItem>
      </TagGroup>,
    );
    const remove = getByRole("button", { name: "Remove a" });
    fireEvent.click(remove);

    expect(remove).toBeDisabled();
    expect(onRemove).not.toHaveBeenCalled();
  });
});
