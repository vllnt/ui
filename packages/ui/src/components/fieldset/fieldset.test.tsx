import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Fieldset, FieldsetContent, FieldsetLegend } from "./fieldset";

describe("Fieldset", () => {
  describe("rendering", () => {
    it("renders a legend and content", () => {
      const { getByText } = render(
        <Fieldset>
          <FieldsetLegend>Billing</FieldsetLegend>
          <FieldsetContent>
            <span>Body</span>
          </FieldsetContent>
        </Fieldset>,
      );

      expect(getByText("Billing")).toBeInTheDocument();
      expect(getByText("Body")).toBeInTheDocument();
    });

    it("renders a fieldset element", () => {
      const { getByText } = render(
        <Fieldset>
          <FieldsetLegend>Group</FieldsetLegend>
        </Fieldset>,
      );

      expect(getByText("Group").closest("fieldset")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<Fieldset className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("disabled state", () => {
    it("disables nested controls", () => {
      const { getByRole } = render(
        <Fieldset disabled>
          <button type="button">Action</button>
        </Fieldset>,
      );

      expect(getByRole("button")).toBeDisabled();
    });
  });
});
