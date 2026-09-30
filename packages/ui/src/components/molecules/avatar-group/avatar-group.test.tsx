import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AvatarGroup } from "./avatar-group";

const items = [
  { alt: "Ada Lovelace", fallback: "AL" },
  { alt: "Grace Hopper", fallback: "GH" },
  { alt: "Margaret Hamilton", fallback: "MH" },
  { alt: "Katherine Johnson", fallback: "KJ" },
];

describe("AvatarGroup", () => {
  it("renders visible avatars and merges className", () => {
    const { container } = render(
      <AvatarGroup className="custom-class" items={items.slice(0, 2)} />,
    );
    expect(screen.getByText("AL")).toBeVisible();
    expect(screen.getByText("GH")).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders overflow count when max is provided", () => {
    render(<AvatarGroup items={items} max={3} />);
    expect(screen.getByText("+1")).toBeVisible();
  });
});
