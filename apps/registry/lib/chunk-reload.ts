/**
 * Recovery from a stale page after a deploy.
 *
 * A page loaded before a deploy keeps asking for the script chunks of its own
 * build. The new server no longer has them, so a lazy import fails with a
 * ChunkLoadError. A single reload fetches the new page and its new chunks.
 * The guard below makes sure that reload happens at most once per window, so
 * a chunk the server no longer has cannot cause a reload loop.
 */

/** Session storage key holding the time of the last recovery reload. */
export const CHUNK_RELOAD_KEY = "vllnt:chunk-reload-at";

/** At most one recovery reload per tab in this window. */
export const CHUNK_RELOAD_WINDOW_MS = 5 * 60 * 1000;

const CHUNK_ERROR =
  /chunkloaderror|loading (?:css )?chunk [\w-]+ failed|failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|failed to load chunk/i;

/** Whether an error (or rejection reason) means a script or style chunk failed to load. */
export function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    return CHUNK_ERROR.test(error.name) || CHUNK_ERROR.test(error.message);
  }

  return typeof error === "string" && CHUNK_ERROR.test(error);
}

type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;

type ReloadDeps = {
  readonly now: number;
  readonly reload: () => void;
  readonly storage?: Storage;
};

/**
 * Reloads the page for a chunk error, unless it already did so inside the window.
 *
 * @param error - the thrown error or rejection reason
 * @param deps - clock, reload function and session storage (undefined when blocked)
 * @returns `true` when it called `reload`
 */
export function reloadOnceForChunkError(
  error: unknown,
  { now, reload, storage }: ReloadDeps,
): boolean {
  if (!isChunkLoadError(error) || !storage) return false;
  try {
    const stored = storage.getItem(CHUNK_RELOAD_KEY);
    const last = stored === null ? Number.NaN : Number(stored);
    if (Number.isFinite(last) && now - last < CHUNK_RELOAD_WINDOW_MS) {
      return false;
    }
    storage.setItem(CHUNK_RELOAD_KEY, String(now));
  } catch {
    // Without storage there is no loop guard, so do not reload.
    return false;
  }
  reload();

  return true;
}

/** Browser wiring for {@link reloadOnceForChunkError}. */
export function recoverFromChunkError(error: unknown): boolean {
  let storage: Storage | undefined;
  try {
    storage = window.sessionStorage;
  } catch {
    storage = undefined;
  }

  return reloadOnceForChunkError(error, {
    now: Date.now(),
    reload: () => {
      window.location.reload();
    },
    storage,
  });
}
