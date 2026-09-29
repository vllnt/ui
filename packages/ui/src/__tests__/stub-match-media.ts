import { vi } from "vitest";

/**
 * Stubs `window.matchMedia` with a MediaQueryList-shaped mock that always
 * reports `matches`.
 */
export function stubMatchMedia(matches = false): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
      matches,
      media: query,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
}
