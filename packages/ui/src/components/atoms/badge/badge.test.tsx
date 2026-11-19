import { createRef } from "react";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge, badgeVariants } from "./badge";

const STATUS_COLOUR = /(?:bg|border|text)-(?:destructive|info|success|warning)/;

const DOT_TONES = [
  ["danger", "text-destructive"],
  ["info", "text-info"],
  ["neutral", "text-muted-foreground"],
  ["primary", "text-primary"],
  ["success", "text-success"],
  ["warning", "text-warning"],
] as const;

function getRoot(container: HTMLElement): HTMLElement {
  const root = container.firstElementChild;
  if (!(root instanceof HTMLElement)) {
    throw new TypeError("Badge did not render an element");
  }
  return root;
}

describe("Badge", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it.each(["default", "destructive", "outline", "secondary", "soft"] as const)(
    "renders %s variant",
    (variant) => {
      const { container } = render(<Badge variant={variant}>Test</Badge>);
      expect(container.firstChild).toBeInTheDocument();
    },
  );

  it("keeps the previous look when none of the new props are set", () => {
    const { container } = render(<Badge>Test</Badge>);
    const root = getRoot(container);
    expect(root).toHaveClass(
      "rounded-full",
      "border",
      "px-2.5",
      "py-0.5",
      "text-xs",
      "font-semibold",
      "bg-primary",
      "text-primary-foreground",
    );
    expect(root.querySelector("[data-badge-dot]")).toBeNull();
    expect(root).not.toHaveClass("gap-1.5");
  });

  it.each([
    ["default", "bg-primary"],
    ["destructive", "bg-destructive"],
    ["secondary", "bg-secondary"],
    ["soft", "bg-muted"],
  ] as const)("variant %s draws %s", (variant, surface) => {
    const { container } = render(<Badge variant={variant}>Test</Badge>);
    expect(getRoot(container)).toHaveClass(surface);
  });

  it("draws the outline variant without a fill", () => {
    const { container } = render(<Badge variant="outline">Test</Badge>);
    const root = getRoot(container);
    expect(root).toHaveClass("text-foreground");
    expect(root.className).not.toMatch(/(?:^|\s)bg-/);
  });

  describe("tone with a dot", () => {
    it.each(DOT_TONES)(
      "tone %s colours the dot (%s) and leaves the chip neutral",
      (tone, dotClass) => {
        const { container } = render(
          <Badge dot tone={tone}>
            Label
          </Badge>,
        );
        const root = getRoot(container);
        const dot = root.querySelector("[data-badge-dot]");
        expect(dot).toHaveClass(dotClass, "bg-current", "rounded-full");
        expect(dot).toHaveAttribute("aria-hidden", "true");
        expect(root).toHaveClass("bg-secondary", "gap-1.5");
        expect(root.className).not.toMatch(STATUS_COLOUR);
      },
    );

    it("keeps the label in the foreground colour of the surface", () => {
      const { container } = render(
        <Badge dot tone="danger">
          Failed
        </Badge>,
      );
      const root = getRoot(container);
      expect(root).toHaveClass("text-secondary-foreground");
      expect(root).toHaveTextContent("Failed");
    });

    it("uses the secondary surface unless a variant is set", () => {
      const { container } = render(
        <Badge tone="success" variant="outline">
          Test
        </Badge>,
      );
      const root = getRoot(container);
      expect(root).not.toHaveClass("bg-secondary");
      expect(root).toHaveClass("text-foreground");
    });

    it("lets the soft variant set the surface", () => {
      const { container } = render(
        <Badge dot tone="info" variant="soft">
          Test
        </Badge>,
      );
      expect(getRoot(container)).toHaveClass("bg-muted");
    });

    it("follows the label colour when there is a dot but no tone", () => {
      const { container } = render(<Badge dot>Test</Badge>);
      const dot = getRoot(container).querySelector("[data-badge-dot]");
      expect(dot).toHaveClass("bg-current");
      expect(dot?.className).not.toMatch(/text-/);
    });

    it("renders no dot unless asked", () => {
      const { container } = render(<Badge tone="success">Test</Badge>);
      expect(getRoot(container).querySelector("[data-badge-dot]")).toBeNull();
    });
  });

  describe("filled tones", () => {
    it("solid fills with primary", () => {
      const { container } = render(<Badge tone="solid">Test</Badge>);
      expect(getRoot(container)).toHaveClass(
        "bg-primary",
        "text-primary-foreground",
      );
    });

    it("danger-solid fills with destructive and overrides the variant", () => {
      const { container } = render(
        <Badge tone="danger-solid" variant="secondary">
          Test
        </Badge>,
      );
      const root = getRoot(container);
      expect(root).toHaveClass(
        "bg-destructive",
        "text-destructive-foreground",
        "hover:bg-destructive/80",
      );
      expect(root).not.toHaveClass("bg-secondary");
      expect(root).not.toHaveClass("hover:bg-secondary/80");
    });

    it("danger-tint is the one tinted surface", () => {
      const { container } = render(<Badge tone="danger-tint">Test</Badge>);
      expect(getRoot(container)).toHaveClass(
        "bg-destructive/10",
        "text-destructive",
        "border-destructive/30",
      );
    });

    it("lets the dot inherit the label colour on a filled surface", () => {
      const { container } = render(
        <Badge dot tone="danger-solid">
          Test
        </Badge>,
      );
      const dot = getRoot(container).querySelector("[data-badge-dot]");
      expect(dot).toHaveClass("bg-current");
      expect(dot?.className).not.toMatch(/text-/);
    });
  });

  it.each([
    ["default", ["px-2.5", "py-0.5", "text-xs"]],
    ["header", ["px-3", "py-1", "text-sm"]],
    ["inline", ["px-1.5", "py-0", "text-[10px]"]],
    ["sm", ["px-2", "py-0", "text-[11px]"]],
  ] as const)("size %s sets its padding and text size", (size, classes) => {
    const { container } = render(<Badge size={size}>Test</Badge>);
    expect(getRoot(container)).toHaveClass(...classes);
  });

  describe("border", () => {
    it("none removes the outline variant's border", () => {
      const { container } = render(
        <Badge border="none" variant="outline">
          Test
        </Badge>,
      );
      expect(getRoot(container)).toHaveClass("border-transparent");
    });

    it("strong draws a full-contrast border over a transparent one", () => {
      const { container } = render(
        <Badge border="strong" variant="secondary">
          Test
        </Badge>,
      );
      const root = getRoot(container);
      expect(root).toHaveClass("border-foreground");
      expect(root).not.toHaveClass("border-transparent");
    });

    it("is not set unless asked, so the variant keeps its own border", () => {
      const { container } = render(<Badge variant="outline">Test</Badge>);
      const root = getRoot(container);
      expect(root).not.toHaveClass("border-transparent");
      expect(root).not.toHaveClass("border-foreground");
    });
  });

  it("forwards the ref and HTML attributes to the root", () => {
    const reference = createRef<HTMLSpanElement>();
    const { container } = render(
      <Badge data-testid="badge" ref={reference} title="Status">
        Test
      </Badge>,
    );
    expect(reference.current).toBe(getRoot(container));
    expect(reference.current).toHaveAttribute("title", "Status");
    expect(reference.current).toHaveAttribute("data-testid", "badge");
  });

  it("keeps badgeVariants usable on its own", () => {
    expect(badgeVariants({ variant: "secondary" })).toContain("bg-secondary");
    expect(badgeVariants({ size: "sm", tone: "solid" })).toContain(
      "bg-primary",
    );
  });
});
