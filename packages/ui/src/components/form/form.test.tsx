import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "../input";

import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

describe("Form", () => {
  it("wires the label to the generated control id", () => {
    render(
      <Form>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    const label = screen.getByText("Email");

    expect(label).toHaveAttribute("for", input.id);
  });

  it("applies invalid aria wiring to the control and message", () => {
    render(
      <Form invalid>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormDescription>Use your work email address.</FormDescription>
          <FormMessage>Please enter a valid email.</FormMessage>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    const description = screen.getByText("Use your work email address.");
    const message = screen.getByRole("alert");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      `${description.id} ${message.id}`,
    );
    expect(message).toHaveTextContent("Please enter a valid email.");
  });

  it("propagates disabled and required state to native controls", () => {
    render(
      <Form disabled required>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");

    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-disabled", "true");
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("keeps helper text in aria-describedby without linking a valid message", () => {
    render(
      <Form>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl aria-describedby="external-help">
            <Input type="email" />
          </FormControl>
          <FormDescription>
            We only use this for account updates.
          </FormDescription>
          <FormMessage>Looks good.</FormMessage>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    const description = screen.getByText(
      "We only use this for account updates.",
    );
    const message = screen.getByText("Looks good.");

    expect(input).toHaveAttribute(
      "aria-describedby",
      `external-help ${description.id}`,
    );
    expect(input).not.toHaveAttribute("aria-invalid", "true");
    expect(message).not.toHaveAttribute("role", "alert");
  });

  it("creates unique aria wiring for each form item", () => {
    render(
      <Form>
        <FormItem>
          <FormLabel>First name</FormLabel>
          <FormControl>
            <Input />
          </FormControl>
          <FormDescription>Given name</FormDescription>
          <FormMessage>Required</FormMessage>
        </FormItem>
        <FormItem>
          <FormLabel>Last name</FormLabel>
          <FormControl>
            <Input />
          </FormControl>
          <FormDescription>Family name</FormDescription>
          <FormMessage>Required</FormMessage>
        </FormItem>
      </Form>,
    );

    const firstInput = screen.getByRole("textbox", { name: "First name" });
    const lastInput = screen.getByRole("textbox", { name: "Last name" });
    const firstDescription = screen.getByText("Given name");
    const lastDescription = screen.getByText("Family name");
    const [firstMessage, secondMessage] = screen.getAllByText("Required");

    expect(firstMessage).toBeDefined();
    expect(secondMessage).toBeDefined();

    if (!firstMessage || !secondMessage) {
      throw new Error("Expected both required messages to be rendered.");
    }

    expect(firstInput.id).not.toBe(lastInput.id);
    expect(firstDescription.id).not.toBe(lastDescription.id);
    expect(firstMessage.id).not.toBe(secondMessage.id);
    expect(firstInput).toHaveAttribute("aria-describedby", firstDescription.id);
    expect(lastInput).toHaveAttribute("aria-describedby", lastDescription.id);
  });

  it("keeps root-level custom ids unique across form items", () => {
    render(
      <Form
        controlId="field"
        descriptionId="field-description"
        messageId="field-message"
      >
        <FormItem>
          <FormLabel>Primary email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormDescription>Primary contact</FormDescription>
          <FormMessage>Required</FormMessage>
        </FormItem>
        <FormItem>
          <FormLabel>Backup email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormDescription>Secondary contact</FormDescription>
          <FormMessage>Required</FormMessage>
        </FormItem>
      </Form>,
    );

    const primaryInput = screen.getByRole("textbox", { name: "Primary email" });
    const backupInput = screen.getByRole("textbox", { name: "Backup email" });
    const primaryDescription = screen.getByText("Primary contact");
    const backupDescription = screen.getByText("Secondary contact");
    const [primaryMessage, backupMessage] = screen.getAllByText("Required");

    expect(primaryMessage).toBeDefined();
    expect(backupMessage).toBeDefined();

    if (!primaryMessage || !backupMessage) {
      throw new Error("Expected both required messages to be rendered.");
    }

    expect(primaryInput.id).toMatch(/^field-/);
    expect(backupInput.id).toMatch(/^field-/);
    expect(primaryInput.id).not.toBe(backupInput.id);
    expect(primaryDescription.id).toMatch(/^field-description-/);
    expect(backupDescription.id).toMatch(/^field-description-/);
    expect(primaryMessage.id).toMatch(/^field-message-/);
    expect(backupMessage.id).toMatch(/^field-message-/);
    expect(primaryMessage.id).not.toBe(backupMessage.id);
  });
});
