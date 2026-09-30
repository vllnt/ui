import { render, screen } from "@testing-library/react";
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
  it("renders media, content, and actions with custom className", () => {
    const { container } = render(
      <Item className="custom-class">
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
    expect(screen.getByText("icon")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Act")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it.each([
    { variant: "default" },
    { variant: "muted" },
    { variant: "outline" },
    { size: "default" },
    { size: "sm" },
  ] as const)("renders with %o", (props) => {
    const { container } = render(<Item {...props}>Item</Item>);
    expect(container.firstChild).toBeInTheDocument();
  });
});
