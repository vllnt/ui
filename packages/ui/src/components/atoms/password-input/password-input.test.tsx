import * as React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PasswordInput } from "./password-input";

describe("PasswordInput", () => {
  it("starts as a password field with merged classes and toggles visibility", () => {
    render(<PasswordInput className="custom-class" />);
    const input = screen.getByLabelText("Show password").previousSibling;
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveClass("custom-class");

    fireEvent.click(screen.getByLabelText("Show password"));

    expect(
      screen.getByLabelText("Hide password").previousSibling,
    ).toHaveAttribute("type", "text");
  });
});

describe("PasswordInput native input props", () => {
  it("hands every input prop to the input and names the toggle by its action", () => {
    const reference = React.createRef<HTMLInputElement>();
    render(
      <PasswordInput
        aria-label="Secret"
        disabled
        hideLabel="Conceal"
        id="secret"
        name="secret"
        placeholder="Type it"
        ref={reference}
        required
        showLabel="Reveal"
      />,
    );
    const input = screen.getByLabelText("Secret");
    expect(input).toBe(reference.current);
    expect(input).toHaveAttribute("id", "secret");
    expect(input).toHaveAttribute("name", "secret");
    expect(input).toHaveAttribute("placeholder", "Type it");
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reveal" })).not.toHaveAttribute(
      "aria-pressed",
    );
  });

  it("adds no autocomplete hint of its own, and forwards the caller's", () => {
    const { rerender } = render(<PasswordInput aria-label="Secret" />);
    expect(screen.getByLabelText("Secret")).not.toHaveAttribute("autocomplete");
    rerender(<PasswordInput aria-label="Secret" autoComplete="new-password" />);
    expect(screen.getByLabelText("Secret")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
  });

  it("keeps a data-slot passed by the caller on the input", () => {
    const { rerender } = render(
      <PasswordInput aria-label="Secret" data-slot="field-control" />,
    );
    expect(screen.getByLabelText("Secret")).toHaveAttribute(
      "data-slot",
      "field-control",
    );
    rerender(<PasswordInput aria-label="Secret" />);
    expect(screen.getByLabelText("Secret")).toHaveAttribute(
      "data-slot",
      "password-input-control",
    );
  });

  it("starts from defaultValue and reports typing through onChange", () => {
    const onChange =
      vi.fn<(event: React.ChangeEvent<HTMLInputElement>) => void>();
    render(
      <PasswordInput
        aria-label="Secret"
        defaultValue="abc"
        onChange={onChange}
      />,
    );
    const input = screen.getByLabelText("Secret");
    expect(input).toHaveValue("abc");
    fireEvent.change(input, { target: { value: "abcd" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0].target).toBe(input);
    expect(input).toHaveValue("abcd");
  });

  it("follows value and lets onChange decide what the input shows", () => {
    function Controlled() {
      const [value, setValue] = React.useState("a");
      return (
        <PasswordInput
          aria-label="Secret"
          onChange={(event) => {
            setValue(event.target.value.toUpperCase());
          }}
          value={value}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByLabelText("Secret");
    expect(input).toHaveValue("a");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(input).toHaveValue("ABC");
  });

  it("submits the value under its name with the form", () => {
    render(
      <form data-testid="form">
        <PasswordInput aria-label="Secret" defaultValue="hunter2" name="pw" />
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>("form"));
    expect(data.get("pw")).toBe("hunter2");
  });

  it("disables the toggle with the input", () => {
    render(<PasswordInput aria-label="Secret" defaultValue="x" disabled />);
    fireEvent.click(screen.getByLabelText("Show password"));
    expect(screen.getByLabelText("Secret")).toHaveAttribute("type", "password");
  });

  it("keeps a read-only field readable through the toggle", () => {
    render(<PasswordInput aria-label="Secret" defaultValue="x" readOnly />);
    expect(screen.getByLabelText("Secret")).toHaveAttribute("readonly");
    fireEvent.click(screen.getByLabelText("Show password"));
    expect(screen.getByLabelText("Secret")).toHaveAttribute("type", "text");
  });
});
