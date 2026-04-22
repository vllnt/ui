import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoleBadge } from "./role-badge";

describe("RoleBadge", () => {
  it("renders the provided role label", () => {
    render(<RoleBadge accountRole="owner" />);

    expect(screen.getByText("Owner")).toBeVisible();
  });

  it("accepts a custom label", () => {
    render(<RoleBadge accountRole="billing" label="Finance" />);

    expect(screen.getByText("Finance")).toBeInTheDocument();
  });

  it("renders member role without errors", () => {
    render(<RoleBadge accountRole="member" />);

    expect(screen.getByText("Member")).toBeVisible();
  });
});
