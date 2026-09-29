import { vi } from "vitest";

/**
 * Stubs `window.matchMedia` with a MediaQueryList-shaped mock that always
 * reports `matches`. Returns the mock so tests can assert on queries.
 */
export function stubMatchMedia(matches = false) {
  const matchMedia = vi.fn((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
    matches,
    media: query,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }));
  vi.stubGlobal("matchMedia", matchMedia);
  return matchMedia;
}
