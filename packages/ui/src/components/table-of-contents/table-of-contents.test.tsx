import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TableOfContents } from "./table-of-contents";

const emptyEntries = (): IntersectionObserverEntry[] => [];

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(emptyEntries);
  root = null;
  rootMargin = "";
  thresholds: readonly number[] = [];
}

beforeEach(() => {
  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    value: MockIntersectionObserver,
    writable: true,
  });
});

describe("TableOfContents", () => {
  const sections = [
    { id: "intro", title: "Introduction" },
    { id: "design", title: "Design" },
    { id: "api", title: "API" },
  ];

  it("renders one button per section", () => {
    render(<TableOfContents sections={sections} />);

    expect(screen.getByText("Introduction")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("API")).toBeInTheDocument();
  });

  it("renders nothing when sections is empty", () => {
    const { container } = render(<TableOfContents sections={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders the on-this-page heading", () => {
    render(<TableOfContents sections={sections} />);

    expect(screen.getByText("On This Page")).toBeInTheDocument();
  });

  it("renders sections inside an aside landmark", () => {
    const { container } = render(<TableOfContents sections={sections} />);

    expect(container.querySelector("aside")).toBeInTheDocument();
  });
});
