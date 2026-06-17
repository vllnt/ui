import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./item";

describe("Item", () => {
  describe("rendering", () => {
    it("renders media, content, and actions", () => {
      const { getByText } = render(
        <Item>
          <ItemMedia>
            <span>icon</span>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Title</ItemTitle>
            <ItemDescription>Description</ItemDescription>
          </ItemContent>
          <ItemActions>
            <button type="button">Act</button>
          </ItemActions>
        </Item>,
      );

      expect(getByText("icon")).toBeInTheDocument();
      expect(getByText("Title")).toBeInTheDocument();
      expect(getByText("Description")).toBeInTheDocument();
      expect(getByText("Act")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<Item className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("variant variants", () => {
    it.each(["default", "muted", "outline"] as const)(
      "renders %s variant",
      (variant) => {
        const { container } = render(<Item variant={variant}>Item</Item>);

        expect(container.firstChild).toBeInTheDocument();
      },
    );
  });

  describe("size variants", () => {
    it.each(["default", "sm"] as const)("renders %s size", (size) => {
      const { container } = render(<Item size={size}>Item</Item>);

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
