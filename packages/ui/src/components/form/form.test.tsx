import * as React from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { Button } from "../button";
import { Input } from "../input";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

const emailSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type EmailValues = z.infer<typeof emailSchema>;

type NativeSubmitEvent = Parameters<
  NonNullable<React.ComponentPropsWithoutRef<"form">["onSubmit"]>
>[0];

describe("Form", () => {
  it("renders a native form element and forwards props, ref, and submit", async () => {
    const handleSubmit = vi.fn();
    const ref = React.createRef<HTMLFormElement>();
    const { container } = render(
      <Form
        className="custom-form"
        data-testid="login-form"
        name="login"
        onSubmit={handleSubmit}
        ref={ref}
      >
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
        </FormItem>
        <button type="submit">Submit</button>
      </Form>,
    );

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form).toBe(ref.current);
    expect(form).toHaveClass("custom-form");
    expect(form).toHaveClass("space-y-2");
    expect(form).toHaveAttribute("data-testid", "login-form");
    expect(form).toHaveAttribute("name", "login");

    if (!form) {
      throw new Error("Expected form element to be rendered.");
    }

    fireEvent.submit(form);
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
    const submittedEvent = handleSubmit.mock.calls[0]?.[0] as
      | NativeSubmitEvent
      | undefined;
    expect(submittedEvent).toBeTruthy();
    expect(submittedEvent?.target).toBe(form);
  });

  it("skips validated submission when the native submit handler prevents default", async () => {
    const nativeSubmit = vi.fn((event: NativeSubmitEvent) => {
      event.preventDefault();
    });
    const validSubmit = vi.fn();

    render(
      <Form<EmailValues>
        defaultValues={{ email: "person@example.com" }}
        onSubmit={nativeSubmit}
        onValidSubmit={validSubmit}
        schema={emailSchema}
      >
        {(form) => (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </>
        )}
      </Form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(nativeSubmit).toHaveBeenCalledTimes(1);
    });
    expect(validSubmit).not.toHaveBeenCalled();
  });

  it("omits aria-describedby when no description or message is rendered", () => {
    render(
      <Form onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("preserves caller aria-describedby when description and message are absent", () => {
    render(
      <Form invalid onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl aria-describedby="external-help">
            <Input type="email" />
          </FormControl>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "external-help");
  });

  it("does not link the message id when invalid but no FormMessage is rendered", () => {
    render(
      <Form invalid onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormDescription>Help text</FormDescription>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    const description = screen.getByText("Help text");
    expect(input).toHaveAttribute("aria-describedby", description.id);
  });

  it("does not render or link empty message content", () => {
    render(
      <Form invalid onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormMessage>{null}</FormMessage>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does not link the description id when no FormDescription is rendered", () => {
    render(
      <Form invalid onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormMessage>Required</FormMessage>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    const message = screen.getByRole("alert");
    expect(input).toHaveAttribute("aria-describedby", message.id);
  });

  it("renders description and message ids in server markup on the first pass", () => {
    const markup = renderToStaticMarkup(
      <Form invalid onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormDescription>Help text</FormDescription>
          <FormMessage>Required</FormMessage>
        </FormItem>
      </Form>,
    );

    expect(markup).toContain("aria-describedby=");
    expect(markup).toContain("-description");
    expect(markup).toContain("-message");
  });

  it("ignores native id overrides that would break form associations", () => {
    render(
      <Form invalid onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl id="custom-control-id">
            <Input type="email" />
          </FormControl>
          <FormDescription id="custom-description-id">
            Help text
          </FormDescription>
          <FormMessage id="custom-message-id">Required</FormMessage>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    const label = screen.getByText("Email");
    const description = screen.getByText("Help text");
    const message = screen.getByRole("alert");

    expect(input.id).not.toBe("custom-control-id");
    expect(description.id).not.toBe("custom-description-id");
    expect(message.id).not.toBe("custom-message-id");
    expect(label).toHaveAttribute("for", input.id);
    expect(input).toHaveAttribute(
      "aria-describedby",
      `${description.id} ${message.id}`,
    );
  });

  it("wires labels, descriptions, and validation errors through form context", async () => {
    const handleSubmit = vi.fn();

    render(
      <Form<EmailValues>
        defaultValues={{ email: "" }}
        onValidSubmit={handleSubmit}
        schema={emailSchema}
      >
        {(form) => (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use your work email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </>
        )}
      </Form>,
    );

    const input = screen.getByRole("textbox", { name: "Email" });
    const label = screen.getByText("Email");
    const description = screen.getByText("Use your work email address.");

    expect(label).toHaveAttribute("for", input.id);
    expect(input).toHaveAttribute("aria-describedby", description.id);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    const message = await screen.findByRole("alert");

    expect(message).toHaveTextContent("Enter a valid email address.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      `${description.id} ${message.id}`,
    );
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("supports legacy invalid layouts without FormField context", () => {
    render(
      <Form invalid onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="name@company.com" type="email" />
          </FormControl>
          <FormDescription>Use your work email address.</FormDescription>
          <FormMessage>Please enter a valid email.</FormMessage>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox", { name: "Email" });
    const description = screen.getByText("Use your work email address.");
    const message = screen.getByText("Please enter a valid email.");

    expect(input).toHaveAttribute(
      "aria-describedby",
      `${description.id} ${message.id}`,
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(message).toHaveAttribute("role", "alert");
  });

  it("supports server-side field errors via setError", async () => {
    render(
      <Form<EmailValues>
        defaultValues={{ email: "person@example.com" }}
        onValidSubmit={async (_values, form) => {
          form.setError("email", {
            message: "This email is already in use.",
            type: "server",
          });
        }}
        schema={emailSchema}
      >
        {(form) => (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormDescription>
                    We will send invitations here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </>
        )}
      </Form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This email is already in use.",
    );
  });

  it("omits form message ids from aria-describedby when an error has no visible message", async () => {
    function FormHarness() {
      const form = useForm<EmailValues>({
        defaultValues: { email: "person@example.com" },
      });

      return (
        <Form form={form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormDescription>
                  We will send invitations here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            onClick={() => {
              form.setError("email", { type: "server" });
            }}
            type="button"
          >
            Trigger silent error
          </Button>
        </Form>
      );
    }

    render(<FormHarness />);

    const input = screen.getByRole("textbox", { name: "Email" });
    const description = screen.getByText("We will send invitations here.");

    fireEvent.click(
      screen.getByRole("button", { name: "Trigger silent error" }),
    );

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-describedby", description.id);
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  it("exposes submitting state to children and disables controls while pending", async () => {
    let resolveSubmit: (() => void) | undefined;
    const handlePendingSubmit = () =>
      new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

    render(
      <Form<EmailValues>
        defaultValues={{ email: "person@example.com" }}
        onValidSubmit={handlePendingSubmit}
        schema={emailSchema}
      >
        {(form) => (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? "Saving…" : "Submit"}
            </Button>
          </>
        )}
      </Form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Email" })).toBeDisabled();
    });

    if (resolveSubmit === undefined) {
      throw new Error("Expected submit promise resolver to be captured.");
    }

    resolveSubmit();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
      expect(screen.getByRole("textbox", { name: "Email" })).toBeEnabled();
    });
  });

  it("propagates disabled and required state to native controls", () => {
    render(
      <Form disabled onSubmit={vi.fn()} required>
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

  it("preserves control-level disabled and required props when the form is not flagged", () => {
    render(
      <Form onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl disabled required>
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

  it("allows a form item to override invalid state independently", () => {
    render(
      <Form invalid onSubmit={vi.fn()}>
        <FormItem invalid={false}>
          <FormLabel>Primary email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormDescription>Looks good</FormDescription>
          <FormMessage>All set</FormMessage>
        </FormItem>
        <FormItem>
          <FormLabel>Backup email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormMessage>Required</FormMessage>
        </FormItem>
      </Form>,
    );

    const primaryInput = screen.getByRole("textbox", { name: "Primary email" });
    const backupInput = screen.getByRole("textbox", { name: "Backup email" });
    const primaryMessage = screen.getByText("All set");
    const backupMessage = screen.getByRole("alert");

    expect(primaryInput).not.toHaveAttribute("aria-invalid", "true");
    expect(primaryInput).toHaveAttribute(
      "aria-describedby",
      screen.getByText("Looks good").id,
    );
    expect(primaryMessage).not.toHaveAttribute("role", "alert");
    expect(backupInput).toHaveAttribute("aria-invalid", "true");
    expect(backupMessage).toHaveTextContent("Required");
  });

  it("links wrapped description and message content", () => {
    render(
      <Form invalid onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <div>
            <FormDescription>Wrapped help</FormDescription>
          </div>
          <div>
            <FormMessage>Wrapped error</FormMessage>
          </div>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    const description = screen.getByText("Wrapped help");
    const message = screen.getByRole("alert");

    expect(input).toHaveAttribute(
      "aria-describedby",
      `${description.id} ${message.id}`,
    );
    expect(message).toHaveTextContent("Wrapped error");
  });

  it("supports fragment-wrapped helper content", () => {
    render(
      <Form invalid onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <>
            <FormDescription>Fragment help</FormDescription>
            <FormMessage>Fragment error</FormMessage>
          </>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    const description = screen.getByText("Fragment help");
    const message = screen.getByRole("alert");

    expect(input).toHaveAttribute(
      "aria-describedby",
      `${description.id} ${message.id}`,
    );
    expect(message).toHaveTextContent("Fragment error");
  });

  it("keeps helper text in aria-describedby without linking a valid message", () => {
    render(
      <Form onSubmit={vi.fn()}>
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
      <Form onSubmit={vi.fn()}>
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
    const messages = screen.getAllByText("Required");
    expect(messages).toHaveLength(2);
    const [firstMessage, secondMessage] = messages;

    if (!firstMessage || !secondMessage) {
      throw new Error("Expected two message elements.");
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
        onSubmit={vi.fn()}
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
    const messages = screen.getAllByText("Required");
    expect(messages).toHaveLength(2);
    const [primaryMessage, backupMessage] = messages;

    if (!primaryMessage || !backupMessage) {
      throw new Error("Expected two message elements.");
    }

    expect(primaryInput.id).toMatch(/^field-control-/);
    expect(backupInput.id).toMatch(/^field-control-/);
    expect(primaryInput.id).not.toBe(backupInput.id);
    expect(primaryDescription.id).toMatch(/^field-description-/);
    expect(backupDescription.id).toMatch(/^field-description-/);
    expect(primaryMessage.id).toMatch(/^field-message-/);
    expect(backupMessage.id).toMatch(/^field-message-/);
    expect(primaryMessage.id).not.toBe(backupMessage.id);
  });

  it("keeps partial custom id overrides scoped to their role", () => {
    render(
      <Form controlId="field" onSubmit={vi.fn()}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormDescription>Scoped description</FormDescription>
          <FormMessage>Scoped message</FormMessage>
        </FormItem>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    const description = screen.getByText("Scoped description");
    const message = screen.getByText("Scoped message");

    expect(input.id).toMatch(/^field-control-/);
    expect(description.id).toMatch(/-description$/);
    expect(message.id).toMatch(/-message$/);
    expect(description.id).not.toBe(input.id);
    expect(message.id).not.toBe(input.id);
  });
});
