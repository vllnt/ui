import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";

describe("InputGroup", () => {
  describe("rendering", () => {
    it("renders an input with addons", () => {
      const { getByPlaceholderText, getByText } = render(
        <InputGroup>
          <InputGroupAddon>$</InputGroupAddon>
          <InputGroupInput placeholder="Amount" />
        </InputGroup>,
      );

      expect(getByText("$")).toBeInTheDocument();
      expect(getByPlaceholderText("Amount")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<InputGroup className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("exposes a group role", () => {
      const { getByRole } = render(<InputGroup />);

      expect(getByRole("group")).toBeInTheDocument();
    });
  });

  describe("addon alignment", () => {
    it.each(["leading", "trailing"] as const)(
      "renders %s alignment",
      (align) => {
        const { getByText } = render(
          <InputGroupAddon align={align}>icon</InputGroupAddon>,
        );

        expect(getByText("icon")).toBeInTheDocument();
      },
    );
  });

  describe("input", () => {
    it("forwards the disabled attribute", () => {
      const { getByRole } = render(<InputGroupInput disabled />);

      expect(getByRole("textbox")).toBeDisabled();
    });
  });
});
