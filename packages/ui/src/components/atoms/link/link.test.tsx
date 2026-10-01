import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Link } from "./link";

describe("Link", () => {
  it("renders an internal anchor with href and className without forcing target", () => {
    render(
      <Link className="custom-class" href="/docs">
        Docs
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass("custom-class");
    expect(link).not.toHaveAttribute("target");
  });

  it.each(["default", "muted", "underline"] as const)(
    "renders %s variant",
    (variant) => {
      render(
        <Link href="/docs" variant={variant}>
          Docs
        </Link>,
      );
      expect(screen.getByRole("link")).toBeInTheDocument();
    },
  );

  it("sets target and safe rel for external links", () => {
    render(
      <Link external href="https://example.com">
        Example
      </Link>,
    );
    const link = screen.getByRole("link", { name: /Example/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("hides the external icon when showExternalIcon is false", () => {
    const { container } = render(
      <Link external href="https://example.com" showExternalIcon={false}>
        Example
      </Link>,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("asChild renders the slotted child element", () => {
    render(
      <Link asChild>
        <button type="button">Action</button>
      </Link>,
    );
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
