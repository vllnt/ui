import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TagGroup, TagGroupItem } from "./tag-group";

describe("TagGroup", () => {
  describe("rendering", () => {
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
  });

  describe("selection", () => {
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
  });

  describe("removal", () => {
    it("calls onRemove when the remove button is clicked", () => {
      const onRemove = vi.fn();
      const { getByLabelText } = render(
        <TagGroup>
          <TagGroupItem onRemove={onRemove} value="a">
            Alpha
          </TagGroupItem>
        </TagGroup>,
      );

      fireEvent.click(getByLabelText("Remove tag"));

      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });
});
