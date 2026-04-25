import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("Form", () => {
  it("wires labels, descriptions, and validation errors through form context", async () => {
    const handleSubmit = vi.fn();

    render(
      <Form<EmailValues>
        defaultValues={{ email: "" }}
        onSubmit={handleSubmit}
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

  it("supports legacy invalid layouts without FormField context", async () => {
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
        onSubmit={async (_values, form) => {
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

  it("exposes submitting state to children and disables controls while pending", async () => {
    let resolveSubmit: (() => void) | undefined;
    const handlePendingSubmit = () =>
      new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

    render(
      <Form<EmailValues>
        defaultValues={{ email: "person@example.com" }}
        onSubmit={handlePendingSubmit}
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
});
