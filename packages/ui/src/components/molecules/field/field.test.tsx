import * as React from "react";

import { act, render, screen } from "@testing-library/react";
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

describe("Field wiring", () => {
  it("points the control at its description and, when invalid, its error", () => {
    const { rerender } = render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <Input />
        </FieldControl>
        <FieldDescription>We never share it.</FieldDescription>
        <FieldError>Required</FieldError>
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    const description = screen.getByText("We never share it.");
    const error = screen.getByRole("alert");
    expect(input.getAttribute("aria-describedby")).toContain(description.id);
    expect(input.getAttribute("aria-describedby")).not.toContain(error.id);
    expect(input).not.toHaveAttribute("aria-invalid");

    rerender(
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <Input />
        </FieldControl>
        <FieldDescription>We never share it.</FieldDescription>
        <FieldError>Required</FieldError>
      </Field>,
    );
    expect(
      screen.getByLabelText("Email").getAttribute("aria-describedby"),
    ).toContain(screen.getByRole("alert").id);
  });

  it("shows an error message even when the field is not marked invalid", () => {
    render(
      <Field>
        <FieldError>Server said no</FieldError>
      </Field>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Server said no");
  });

  it("turns the label destructive only while invalid", () => {
    const { rerender } = render(
      <Field>
        <FieldLabel>Name</FieldLabel>
      </Field>,
    );
    expect(screen.getByText("Name")).not.toHaveClass("text-destructive");
    rerender(
      <Field invalid>
        <FieldLabel>Name</FieldLabel>
      </Field>,
    );
    expect(screen.getByText("Name")).toHaveClass("text-destructive");
  });

  it("never reports the browser's own validation on its own", () => {
    render(
      <form data-testid="form">
        <Field>
          <FieldLabel>Email</FieldLabel>
          <FieldControl>
            <Input required />
          </FieldControl>
          <FieldError>Required</FieldError>
        </Field>
      </form>,
    );
    act(() => {
      screen.getByTestId<HTMLFormElement>("form").requestSubmit();
    });
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  });

  it("passes refs and props to the wrapped control and the parts", () => {
    const control = React.createRef<HTMLElement>();
    const field = React.createRef<HTMLDivElement>();
    const description = React.createRef<HTMLParagraphElement>();
    const error = React.createRef<HTMLParagraphElement>();
    render(
      <Field className="extra" orientation="horizontal" ref={field}>
        <FieldControl ref={control}>
          <Input data-slot="mine" />
        </FieldControl>
        <FieldDescription className="d" data-slot="d" ref={description}>
          Help
        </FieldDescription>
        <FieldError className="e" ref={error}>
          Oops
        </FieldError>
      </Field>,
    );
    expect(control.current).toBe(screen.getByRole("textbox"));
    expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "mine");
    expect(field.current).toHaveClass("extra", "flex-row");
    expect(field.current).toHaveAttribute("data-slot", "field");
    expect(description.current).toHaveClass("d");
    expect(description.current).toHaveAttribute("data-slot", "d");
    expect(error.current).toHaveClass("e");
    expect(error.current).toHaveAttribute("role", "alert");
  });

  it("renders nothing for a control without an element child", () => {
    const { container } = render(
      <Field>
        <FieldControl>just text</FieldControl>
      </Field>,
    );
    expect(container).not.toHaveTextContent("just text");
  });
});
