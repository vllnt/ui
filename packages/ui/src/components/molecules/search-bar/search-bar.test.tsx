import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SearchBar } from "./search-bar";

const mockReplace = vi.fn();
let mockSearchParameters = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParameters,
}));

describe("SearchBar", () => {
  afterEach(() => {
    vi.useRealTimers();
    mockReplace.mockClear();
    mockSearchParameters = new URLSearchParams();
  });

  it("initializes the input from the search URL parameter", () => {
    mockSearchParameters = new URLSearchParams("search=buttons");

    render(<SearchBar />);

    expect(screen.getByLabelText("Search posts...")).toHaveValue("buttons");
  });

  it("submits a trimmed query through the onSearch callback", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText("Search posts..."), {
      target: { value: "  cards  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(onSearch).toHaveBeenCalledWith("cards");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("updates the URL search parameter when no callback is provided", () => {
    mockSearchParameters = new URLSearchParams("category=docs");
    render(<SearchBar />);

    fireEvent.change(screen.getByLabelText("Search posts..."), {
      target: { value: "forms" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(mockReplace).toHaveBeenCalledWith("?category=docs&search=forms");
  });

  it("removes the URL search parameter when submitting an empty query", () => {
    mockSearchParameters = new URLSearchParams("category=docs&search=forms");
    render(<SearchBar />);

    fireEvent.change(screen.getByLabelText("Search posts..."), {
      target: { value: "  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(mockReplace).toHaveBeenCalledWith("?category=docs");
  });

  it("debounces typed changes before calling onSearch", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText("Search posts..."), {
      target: { value: "alerts" },
    });

    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledWith("alerts");
  });

  // Regression: the debounced URL-sync effect called the `onSearch` prop
  // directly (react-doctor no-prop-callback-in-effect). It now routes through
  // a useEffectEvent, which must (a) always invoke the LATEST callback after a
  // parent swaps it, and (b) skip a fresh callback identity for an
  // already-emitted query, so the parent cannot drive an update loop.
  it("invokes the latest onSearch after the parent swaps the callback", () => {
    vi.useFakeTimers();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<SearchBar onSearch={first} />);

    fireEvent.change(screen.getByLabelText("Search posts..."), {
      target: { value: "first" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(first).toHaveBeenCalledExactlyOnceWith("first");

    rerender(<SearchBar onSearch={second} />);

    fireEvent.change(screen.getByLabelText("Search posts..."), {
      target: { value: "second" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(second).toHaveBeenCalledExactlyOnceWith("second");
    // The stale callback is never called again — no lingering subscription.
    expect(first).toHaveBeenCalledTimes(1);
  });

  it("does not re-invoke onSearch when only the callback identity changes", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText("Search posts..."), {
      target: { value: "stable" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("stable");

    // Parent re-renders with a brand-new callback identity but the same query.
    rerender(<SearchBar onSearch={vi.fn()} />);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // No second emission — the effect must not loop on identity churn.
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
