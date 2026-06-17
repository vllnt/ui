import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "../input/input";

import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "./field";

describe("Field", () => {
  describe("rendering", () => {
    it("renders label, control, and description", () => {
      const { getByLabelText, getByText } = render(
        <Field>
          <FieldLabel>Email</FieldLabel>
          <FieldControl>
            <Input />
          </FieldControl>
          <FieldDescription>We never share it.</FieldDescription>
        </Field>,
      );

      expect(getByLabelText("Email")).toBeInTheDocument();
      expect(getByText("We never share it.")).toBeInTheDocument();
    });

    it("wires the label to the control via htmlFor", () => {
      const { getByLabelText } = render(
        <Field>
          <FieldLabel>Name</FieldLabel>
          <FieldControl>
            <Input />
          </FieldControl>
        </Field>,
      );

      expect(getByLabelText("Name").tagName).toBe("INPUT");
    });
  });

  describe("error state", () => {
    it("renders the error and marks the control invalid", () => {
      const { getByLabelText, getByRole } = render(
        <Field invalid>
          <FieldLabel>Password</FieldLabel>
          <FieldControl>
            <Input />
          </FieldControl>
          <FieldError>Too short</FieldError>
        </Field>,
      );

      expect(getByRole("alert")).toHaveTextContent("Too short");
      expect(getByLabelText("Password")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("renders nothing when error has no children", () => {
      const { queryByRole } = render(
        <Field>
          <FieldError />
        </Field>,
      );

      expect(queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("error boundary", () => {
    it("throws when subcomponents render outside a Field", () => {
      expect(() => render(<FieldLabel>Orphan</FieldLabel>)).toThrow();
    });
  });
});
