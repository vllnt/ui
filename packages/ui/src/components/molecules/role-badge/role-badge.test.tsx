import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoleBadge } from "./role-badge";

describe("RoleBadge", () => {
  it.each([
    ["owner", undefined, "Owner"],
    ["billing", "Finance", "Finance"],
    ["member", undefined, "Member"],
  ] as const)("renders the %s role (custom label: %s)", (role, label, text) => {
    render(<RoleBadge accountRole={role} label={label} />);
    expect(screen.getByText(text)).toBeVisible();
  });
});
