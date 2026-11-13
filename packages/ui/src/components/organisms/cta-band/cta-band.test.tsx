import { createRef } from "react";

import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "../../atoms/button/button";

import { CtaBand } from "./cta-band";

describe("CtaBand", () => {
  it("renders the title as a level 2 heading by default", () => {
    render(<CtaBand title="Ship faster" />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Ship faster" }),
    ).toBeVisible();
  });

  it("renders the title at the requested heading level", () => {
    render(<CtaBand headingLevel={3} title="Ship faster" />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Ship faster" }),
    ).toBeVisible();
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
  });

  it("keeps the visual scale fixed when the heading level changes", () => {
    render(<CtaBand headingLevel={4} title="Ship faster" />);

    expect(screen.getByRole("heading", { level: 4 }).className).toContain(
      "--font-size-h2",
    );
  });

  it("renders the description when provided", () => {
    render(<CtaBand description="Free for personal projects." title="Go" />);

    expect(screen.getByText("Free for personal projects.")).toBeVisible();
  });

  it("omits the optional parts when they are not provided", () => {
    const { container } = render(<CtaBand title="Go" />);

    expect(
      container.querySelector("[data-slot='cta-band-description']"),
    ).toBeNull();
    expect(container.querySelector("[data-slot='cta-band-icon']")).toBeNull();
    expect(
      container.querySelector("[data-slot='cta-band-divider']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-slot='cta-band-actions']"),
    ).toBeNull();
  });

  it("renders every action in order", () => {
    render(
      <CtaBand
        actions={
          <>
            <Button>Get started</Button>
            <Button variant="outline">Talk to sales</Button>
            <Button variant="ghost">Docs</Button>
          </>
        }
        title="Go"
      />,
    );

    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["Get started", "Talk to sales", "Docs"]);
  });

  it("hides the icon from assistive technology", () => {
    render(<CtaBand icon={<svg data-testid="glyph" />} title="Go" />);

    expect(
      screen.getByTestId("glyph").closest("[aria-hidden='true']"),
    ).not.toBe(null);
  });

  it("renders a divider only when requested", () => {
    const { container, rerender } = render(<CtaBand title="Go" />);
    expect(
      container.querySelector("[data-slot='cta-band-divider']"),
    ).toBeNull();

    rerender(<CtaBand divider title="Go" />);
    expect(
      container.querySelector("[data-slot='cta-band-divider']"),
    ).not.toBeNull();
  });

  it("defaults to the default tone", () => {
    const { container } = render(<CtaBand title="Go" />);
    const band = container.querySelector<HTMLElement>("[data-slot='cta-band']");

    expect(band?.dataset.tone).toBe("default");
    expect(band?.className).toContain("bg-background");
  });

  it("applies the muted tone and keeps the description readable on it", () => {
    const { container } = render(
      <CtaBand description="Copy" title="Go" tone="muted" />,
    );
    const band = container.querySelector<HTMLElement>("[data-slot='cta-band']");

    expect(band?.dataset.tone).toBe("muted");
    expect(band?.className).toContain("bg-muted");
    expect(screen.getByText("Copy").className).not.toContain(
      "text-muted-foreground",
    );
  });

  it("mutes the description on the default tone", () => {
    render(<CtaBand description="Copy" title="Go" />);

    expect(screen.getByText("Copy").className).toContain(
      "text-muted-foreground",
    );
  });

  it("renders a section that can be exposed as a landmark", () => {
    render(<CtaBand aria-label="Start building" title="Go" />);

    expect(
      screen.getByRole("region", { name: "Start building" }),
    ).toBeVisible();
  });

  it("merges className and forwards props and ref to the section", () => {
    const reference = createRef<HTMLElement>();
    render(
      <CtaBand
        className="custom-class"
        data-testid="band"
        ref={reference}
        title="Go"
      />,
    );

    const band = screen.getByTestId("band");
    expect(band.tagName).toBe("SECTION");
    expect(band.className).toContain("custom-class");
    expect(reference.current).toBe(band);
  });

  it("renders on the server without a client boundary", () => {
    const markup = renderToStaticMarkup(
      <CtaBand
        actions={<a href="/start">Start</a>}
        description="Copy"
        divider
        icon={<svg />}
        title="Go"
      />,
    );

    expect(markup).toContain("<section");
    expect(markup).toContain('href="/start"');
  });
});
