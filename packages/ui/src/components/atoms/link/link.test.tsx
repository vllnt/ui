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

  it.each(["default", "foreground", "muted", "skip", "underline"] as const)(
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

  it("keeps the inherited size by default and adds no size classes", () => {
    render(<Link href="/docs">Docs</Link>);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).not.toHaveClass("h-control-xs");
    expect(link).not.toHaveClass("text-sm");
    expect(link).not.toHaveClass("text-xs");
  });

  it("lg is the bar link: control height, 14 px label, 4 px side padding", () => {
    render(
      <Link href="/docs" size="lg">
        Docs
      </Link>,
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveClass(
      "h-control-xs",
      "px-1",
      "text-sm",
    );
  });

  it("sm sets the small label", () => {
    render(
      <Link href="/docs" size="sm">
        Docs
      </Link>,
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveClass("text-xs");
  });

  it("foreground takes the ink colour and no primary", () => {
    render(
      <Link href="/docs" variant="foreground">
        Docs
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveClass("text-foreground");
    expect(link).not.toHaveClass("text-primary");
  });

  it("skip is hidden until focused, then a 44 px fixed link at the top left above content", () => {
    render(
      <Link href="#main" variant="skip">
        Skip to content
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("href", "#main");
    expect(link).toHaveClass("sr-only", "focus:not-sr-only");
    expect(link).toHaveClass(
      "focus:fixed",
      "focus:left-4",
      "focus:top-4",
      "focus:h-11",
      "focus:z-[100]",
    );
    expect(link).not.toHaveClass("text-primary");
  });

  it("skip link is reachable by keyboard", () => {
    render(
      <>
        <Link href="#main" variant="skip">
          Skip to content
        </Link>
        <main id="main" tabIndex={-1}>
          Main
        </main>
      </>,
    );
    const link = screen.getByRole("link", { name: "Skip to content" });
    link.focus();
    expect(link).toHaveFocus();
  });
});
