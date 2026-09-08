import "@testing-library/jest-dom";

import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

expect.extend(matchers);

const storage = new Map<string, string>();
const localStorageMock: Storage = {
  clear() {
    storage.clear();
  },
  getItem(key) {
    return storage.get(key) ?? null;
  },
  key(index) {
    return [...storage.keys()][index] ?? null;
  },
  get length() {
    return storage.size;
  },
  removeItem(key) {
    storage.delete(key);
  },
  setItem(key, value) {
    storage.set(key, value);
  },
};
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: localStorageMock,
});

class MockResizeObserver {
  observe() {
    return;
  }

  unobserve() {
    return;
  }

  disconnect() {
    return;
  }
}

globalThis.ResizeObserver = MockResizeObserver;

HTMLElement.prototype.scrollIntoView = function scrollIntoView() {
  return;
};
