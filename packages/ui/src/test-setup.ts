import "@testing-library/jest-dom";

import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

expect.extend(matchers);

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
