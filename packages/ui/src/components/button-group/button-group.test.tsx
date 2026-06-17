import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ButtonGroup } from "./button-group";

describe("ButtonGroup", () => {
  describe("rendering", () => {
    it("renders children", () => {
      const { getByText } = render(
        <ButtonGroup>
          <button type="button">One</button>
          <button type="button">Two</button>
        </ButtonGroup>,
      );

      expect(getByText("One")).toBeInTheDocument();
      expect(getByText("Two")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<ButtonGroup className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("exposes a group role", () => {
      const { getByRole } = render(<ButtonGroup />);

      expect(getByRole("group")).toBeInTheDocument();
    });
  });

  describe("orientation variants", () => {
    it.each(["horizontal", "vertical"] as const)(
      "renders %s orientation",
      (orientation) => {
        const { getByRole } = render(<ButtonGroup orientation={orientation} />);

        expect(getByRole("group")).toBeInTheDocument();
      },
    );
  });
});
