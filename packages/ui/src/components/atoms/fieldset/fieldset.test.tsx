import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Fieldset, FieldsetContent, FieldsetLegend } from "./fieldset";

describe("Fieldset", () => {
  it("renders a fieldset element with legend, content, and custom className", () => {
    const { container } = render(
      <Fieldset className="custom-class">
        <FieldsetLegend>Billing</FieldsetLegend>
        <FieldsetContent>
          <span>Body</span>
        </FieldsetContent>
      </Fieldset>,
    );
    expect(screen.getByText("Billing").closest("fieldset")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("disables nested controls", () => {
    render(
      <Fieldset disabled>
        <button type="button">Action</button>
      </Fieldset>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
