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
});
