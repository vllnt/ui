import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ButtonGroup } from "./button-group";

describe("ButtonGroup", () => {
  it("renders children in a group that merges className", () => {
    const { getByRole, getByText } = render(
      <ButtonGroup className="custom-class">
        <button type="button">One</button>
        <button type="button">Two</button>
      </ButtonGroup>,
    );
    expect(getByText("One")).toBeInTheDocument();
    expect(getByText("Two")).toBeInTheDocument();
    expect(getByRole("group")).toHaveClass("custom-class");
  });

  it.each(["horizontal", "vertical"] as const)(
    "renders %s orientation",
    (orientation) => {
      const { getByRole } = render(<ButtonGroup orientation={orientation} />);
      expect(getByRole("group")).toBeInTheDocument();
    },
  );
});
