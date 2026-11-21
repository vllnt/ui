import { describe, expect, it, vi } from "vitest";

import {
  CHUNK_RELOAD_KEY,
  CHUNK_RELOAD_WINDOW_MS,
  isChunkLoadError,
  reloadOnceForChunkError,
} from "./chunk-reload";

function memoryStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null, // eslint-disable-line unicorn/no-null -- the Storage contract
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

function chunkError() {
  const error = new Error(
    "Loading chunk 4821 failed.\n(missing: https://ui.vllnt.com/_next/static/chunks/4821.js)",
  );
  error.name = "ChunkLoadError";

  return error;
}

describe("isChunkLoadError", () => {
  it.each([
    chunkError(),
    new TypeError(
      "Failed to fetch dynamically imported module: https://x/_next/a.js",
    ),
    new TypeError("error loading dynamically imported module"),
    new TypeError("Importing a module script failed."),
    "Loading CSS chunk app-layout failed",
  ])("recognises %s", (error) => {
    expect(isChunkLoadError(error)).toBe(true);
  });

  it.each([
    new Error("Cannot read properties of undefined"),
    undefined,
    { message: "Loading chunk 1 failed" },
  ])("ignores %s", (error) => {
    expect(isChunkLoadError(error)).toBe(false);
  });
});

describe("reloadOnceForChunkError", () => {
  it("reloads once, then not again inside the window (no loop)", () => {
    const storage = memoryStorage();
    const reload = vi.fn();
    const start = 1_000_000;

    expect(
      reloadOnceForChunkError(chunkError(), { now: start, reload, storage }),
    ).toBe(true);
    // The reloaded page fails the same way: the guard holds.
    const retries = [1, 1000, CHUNK_RELOAD_WINDOW_MS - 1].map((later) =>
      reloadOnceForChunkError(chunkError(), {
        now: start + later,
        reload,
        storage,
      }),
    );

    expect(retries).toEqual([false, false, false]);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.getItem(CHUNK_RELOAD_KEY)).toBe(String(start));
  });

  it("may reload again once the window has passed", () => {
    const storage = memoryStorage();
    const reload = vi.fn();

    reloadOnceForChunkError(chunkError(), { now: 0, reload, storage });
    reloadOnceForChunkError(chunkError(), {
      now: CHUNK_RELOAD_WINDOW_MS,
      reload,
      storage,
    });

    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("never reloads for other errors", () => {
    const reload = vi.fn();

    expect(
      reloadOnceForChunkError(new Error("boom"), {
        now: 0,
        reload,
        storage: memoryStorage(),
      }),
    ).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it("does not reload without storage, since nothing could stop a loop", () => {
    const reload = vi.fn();
    const throwing = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("SecurityError");
      },
    };

    expect(
      reloadOnceForChunkError(chunkError(), {
        now: 0,
        reload,
        storage: undefined,
      }),
    ).toBe(false);
    expect(
      reloadOnceForChunkError(chunkError(), {
        now: 0,
        reload,
        storage: throwing,
      }),
    ).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
