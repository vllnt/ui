import { render, screen } from "@testing-library/react";
import type * as QrModule from "qrcode";
import { describe, expect, it, vi } from "vitest";

import { QrCode } from "./qr-code";

const encoder = vi.hoisted(() => ({ calls: 0 }));

vi.mock("qrcode", async (importOriginal) => {
  const actual = await importOriginal<typeof QrModule>();
  return {
    ...actual,
    create: (...arguments_: Parameters<typeof actual.create>) => {
      encoder.calls += 1;
      return actual.create(...arguments_);
    },
  };
});

const pathOf = (container: HTMLElement) =>
  container.querySelector("path")?.getAttribute("d");
const sizeOf = (container: HTMLElement) =>
  Number(
    container.querySelector("svg")?.getAttribute("viewBox")?.split(" ")[2],
  );

describe("QrCode", () => {
  it("renders an accessible svg with encoded modules and merged className", () => {
    const { container } = render(
      <QrCode className="custom-class" value="https://vllnt.com" />,
    );
    const svg = screen.getByRole("img", { name: "QR code" });
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg).toHaveClass("custom-class");
    expect(pathOf(container)).toBeTruthy();
  });

  it("uses a custom accessible title", () => {
    render(<QrCode title="Scan to pay" value="pay" />);
    expect(
      screen.getByRole("img", { name: "Scan to pay" }),
    ).toBeInTheDocument();
  });

  it("encodes different values into different module paths", () => {
    const { container: first } = render(<QrCode value="alpha" />);
    const { container: second } = render(<QrCode value="bravo" />);
    expect(pathOf(first)).not.toBe(pathOf(second));
  });

  it("uses a larger module grid for longer payloads", () => {
    const { container: short } = render(<QrCode value="hi" />);
    const { container: long } = render(<QrCode value={"x".repeat(120)} />);
    expect(sizeOf(long)).toBeGreaterThan(sizeOf(short));
  });

  it("renders an empty path for an empty value without throwing", () => {
    const { container } = render(<QrCode value="" />);
    expect(pathOf(container)).toBe("");
  });
});

describe("QrCode encoding cache", () => {
  it("reuses the encoding when re-rendered with the same inputs", () => {
    const { container, rerender } = render(
      <QrCode value="https://cache.example/a" />,
    );
    const firstPath = pathOf(container);
    const callsAfterFirstRender = encoder.calls;

    rerender(<QrCode className="framed" value="https://cache.example/a" />);
    rerender(<QrCode size={200} value="https://cache.example/a" />);
    expect(encoder.calls).toBe(callsAfterFirstRender);
    expect(pathOf(container)).toBe(firstPath);

    rerender(<QrCode level="H" value="https://cache.example/a" />);
    expect(encoder.calls).toBe(callsAfterFirstRender + 1);
    expect(pathOf(container)).not.toBe(firstPath);
  });
});
