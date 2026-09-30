import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "../../atoms/input/input";

import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "./field";

describe("Field", () => {
  it("wires the label to the input control and renders the description", () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <Input />
        </FieldControl>
        <FieldDescription>We never share it.</FieldDescription>
      </Field>,
    );
    expect(screen.getByLabelText("Email").tagName).toBe("INPUT");
    expect(screen.getByText("We never share it.")).toBeInTheDocument();
  });

  it("renders the error and marks the control invalid", () => {
    render(
      <Field invalid>
        <FieldLabel>Password</FieldLabel>
        <FieldControl>
          <Input />
        </FieldControl>
        <FieldError>Too short</FieldError>
      </Field>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("renders nothing when error has no children", () => {
    render(
      <Field>
        <FieldError />
      </Field>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("throws when subcomponents render outside a Field", () => {
    expect(() => render(<FieldLabel>Orphan</FieldLabel>)).toThrow();
  });
});
