import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CHUNK_RELOAD_KEY,
  CHUNK_RELOAD_WINDOW_MS,
  chunkRecoveryScript,
  RECOVER_GLOBAL,
} from "./chunk-reload";

type Listener = (event: Record<string, unknown>) => void;

/** Runs the inline script against a fake window and returns hooks into it. */
function load(options: { storage?: "blocked" } = {}) {
  const values = new Map<string, string>();
  const listeners = new Map<string, Listener>();
  const reload = vi.fn();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null, // eslint-disable-line unicorn/no-null -- the Storage contract
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const fakeWindow: Record<string, unknown> = {
    addEventListener: (type: string, listener: Listener) => {
      listeners.set(type, listener);
    },
    location: { pathname: "/docs", reload },
  };
  Object.defineProperty(fakeWindow, "sessionStorage", {
    get: () => {
      if (options.storage === "blocked") throw new Error("SecurityError");

      return storage;
    },
  });
  // Run the shipped inline script as the browser would; `window` is its one input.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the inline script under test
  const run = new Function("window", chunkRecoveryScript("abc123")) as (
    target: unknown,
  ) => void;
  run(fakeWindow);
  const recover = fakeWindow[RECOVER_GLOBAL] as (error: unknown) => boolean;

  return { listeners, recover, reload, values };
}

function chunkError() {
  const error = new Error(
    "Loading chunk 4821 failed.\n(missing: /_next/static/chunks/4821.js)",
  );
  error.name = "ChunkLoadError";

  return error;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1_000_000);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("chunk recovery script", () => {
  it.each([
    chunkError(),
    new TypeError("Failed to fetch dynamically imported module: /_next/a.js"),
    new TypeError("error loading dynamically imported module"),
    new TypeError("Importing a module script failed."),
    "Loading CSS chunk app-layout failed",
  ])("reloads for %s", (error) => {
    const { recover, reload } = load();

    expect(recover(error)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it.each([new Error("Cannot read properties of undefined"), undefined])(
    "ignores %s",
    (error) => {
      const { recover, reload } = load();

      expect(recover(error)).toBe(false);
      expect(reload).not.toHaveBeenCalled();
    },
  );

  it("reloads once per page and deploy, then holds inside the window (no loop)", () => {
    const { recover, reload, values } = load();

    recover(chunkError());
    vi.setSystemTime(1_000_000 + CHUNK_RELOAD_WINDOW_MS - 1);
    // The reloaded page fails the same way: the guard holds.
    expect(recover(chunkError())).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(values.get(`${CHUNK_RELOAD_KEY}:abc123:/docs`)).toBe("1000000");

    vi.setSystemTime(1_000_000 + CHUNK_RELOAD_WINDOW_MS);
    expect(recover(chunkError())).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("reloads when a /_next/static script or stylesheet fails to load", () => {
    const { listeners, reload } = load();

    listeners.get("error")?.({
      target: { src: "https://x/_next/static/chunks/a.js", tagName: "SCRIPT" },
    });

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("ignores a failed third-party script and other elements", () => {
    const { listeners, reload } = load();
    const onError = listeners.get("error");

    onError?.({
      target: { src: "https://cdn.example/x.js", tagName: "SCRIPT" },
    });
    onError?.({ target: { src: "/_next/static/media/a.png", tagName: "IMG" } });

    expect(reload).not.toHaveBeenCalled();
  });

  it("reloads for a chunk error thrown or rejected at runtime", () => {
    const thrown = load();
    thrown.listeners.get("error")?.({ error: chunkError(), target: {} });

    const rejected = load();
    rejected.listeners.get("unhandledrejection")?.({ reason: chunkError() });

    expect(thrown.reload).toHaveBeenCalledTimes(1);
    expect(rejected.reload).toHaveBeenCalledTimes(1);
  });

  it("does not reload when sessionStorage is blocked, since nothing could stop a loop", () => {
    const { recover, reload } = load({ storage: "blocked" });

    expect(recover(chunkError())).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
