import "@testing-library/jest-dom/vitest";

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

// ui-sdk opens popovers, menus, selects and dialogs in the browser top layer.
// jsdom has no Popover API and its UA sheet hides every `[popover]`, so an open
// popup would be invisible to queries. Show open ones (closed parts keep
// `hidden`), and give ui-sdk the Web Animations entry point it reads on close.
const popoverStyle = document.createElement("style");
popoverStyle.textContent = "[popover]:not([hidden]) { display: block; }";
document.head.append(popoverStyle);

if (!("getAnimations" in Element.prototype)) {
  Object.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
  });
}
