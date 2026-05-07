import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewsletterSignup } from "./newsletter-signup";

const noopResolver = (): void => undefined;
const noopRejecter = (_reason?: unknown): void => undefined;

function deferred(): {
  promise: Promise<void>;
  reject: (reason?: unknown) => void;
  resolve: () => void;
} {
  let resolve: () => void = noopResolver;
  let reject: (reason?: unknown) => void = noopRejecter;
  const promise = new Promise<void>((resolveFn, rejectFn) => {
    resolve = resolveFn;
    reject = rejectFn;
  });
  return { promise, reject, resolve };
}

function getForm(): HTMLFormElement {
  const button = screen.getByRole("button");
  const form = button.closest("form");
  if (!form) throw new Error("expected the button to be inside a form");
  return form;
}

const noop = (): void => undefined;

describe("NewsletterSignup", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("renders an email input and submit button", () => {
      render(<NewsletterSignup onSubmit={noop} />);

      expect(
        screen.getByPlaceholderText("you@example.com"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Subscribe" }),
      ).toBeInTheDocument();
    });

    it("supports stacked variant", () => {
      render(<NewsletterSignup onSubmit={noop} variant="stacked" />);

      expect(
        screen.getByRole("button", { name: "Subscribe" }),
      ).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("rejects empty input with the validation label", () => {
      const onSubmit = vi.fn(noop);
      render(<NewsletterSignup onSubmit={onSubmit} />);

      fireEvent.submit(getForm());

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Enter a valid email address.",
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("rejects malformed email", () => {
      const onSubmit = vi.fn(noop);
      render(<NewsletterSignup onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText("you@example.com");
      fireEvent.change(input, { target: { value: "not-an-email" } });
      fireEvent.submit(getForm());

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("uses a custom validator when provided", () => {
      const onSubmit = vi.fn(noop);
      const validate = vi.fn(() => "Corporate emails only");
      render(<NewsletterSignup onSubmit={onSubmit} validate={validate} />);

      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: "user@example.com" },
      });
      fireEvent.submit(getForm());

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Corporate emails only",
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("submission", () => {
    it("transitions through sending → sent on success", async () => {
      const submit = deferred();
      const onSubmit = vi.fn(() => submit.promise);
      const onStatusChange = vi.fn();
      render(
        <NewsletterSignup
          onStatusChange={onStatusChange}
          onSubmit={onSubmit}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: "user@example.com" },
      });
      fireEvent.submit(getForm());

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Subscribing/ }),
        ).toBeDisabled();
      });

      submit.resolve();

      await screen.findByRole("status");
      expect(screen.getByRole("status")).toHaveTextContent(
        /You're on the list/,
      );
      expect(onSubmit).toHaveBeenCalledWith("user@example.com");
      expect(onStatusChange).toHaveBeenCalledWith("sending");
      expect(onStatusChange).toHaveBeenCalledWith("sent");
    });

    it("surfaces a custom error message on rejection", async () => {
      const onSubmit = vi.fn(() =>
        Promise.reject(new Error("Already subscribed")),
      );
      render(<NewsletterSignup onSubmit={onSubmit} />);

      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: "user@example.com" },
      });
      fireEvent.submit(getForm());

      await screen.findByText("Already subscribed");
      expect(
        screen.getByRole("button", { name: /Try again/ }),
      ).toBeInTheDocument();
    });

    it("uses the labels.errorFallback override when provided", async () => {
      const onSubmit = vi.fn(() =>
        Promise.reject(new Error("Already subscribed")),
      );
      render(
        <NewsletterSignup
          labels={{ errorFallback: "Network unavailable." }}
          onSubmit={onSubmit}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: "user@example.com" },
      });
      fireEvent.submit(getForm());

      await screen.findByText("Already subscribed");
    });

    it("clears the error when the user edits the input", async () => {
      const onSubmit = vi.fn(() => Promise.reject(new Error("nope")));
      render(<NewsletterSignup onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText("you@example.com");
      fireEvent.change(input, { target: { value: "user@example.com" } });
      fireEvent.submit(getForm());

      await screen.findByText("nope");
      fireEvent.change(input, { target: { value: "user@example.org" } });

      await waitFor(() => {
        expect(screen.queryByText("nope")).not.toBeInTheDocument();
        expect(input).toHaveAttribute("aria-invalid", "false");
        expect(
          screen.getByRole("button", { name: "Subscribe" }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("marks the input invalid + aria-describedby when an error exists", () => {
      render(<NewsletterSignup onSubmit={noop} />);

      const input = screen.getByPlaceholderText("you@example.com");
      fireEvent.submit(getForm());

      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input.getAttribute("aria-describedby")).toBeTruthy();
    });
  });
});
