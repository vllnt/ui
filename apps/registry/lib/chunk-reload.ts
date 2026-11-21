/**
 * Recovery from a stale page after a deploy.
 *
 * A page loaded before a deploy keeps asking for the script chunks of its own
 * build. The new image no longer has them (they answer 404), so a script tag or
 * a lazy import fails. A single reload fetches the new page and its chunks.
 *
 * The recovery runs as an inline `<head>` script: when the main chunks of a
 * stale page fail, React never starts, so a React effect would never run. The
 * error boundaries call the same function through `window`.
 *
 * Loop guard: one reload per page and deploy inside {@link CHUNK_RELOAD_WINDOW_MS},
 * kept in sessionStorage. Without sessionStorage there is no guard, so no reload.
 */

/** Session storage key prefix; the full key adds the deployment id and the pathname. */
export const CHUNK_RELOAD_KEY = "vllnt:chunk-reload";

/** At most one recovery reload per page and deploy in this window. */
export const CHUNK_RELOAD_WINDOW_MS = 30_000;

/** Name of the recovery function the inline script puts on `window`. */
export const RECOVER_GLOBAL = "__vllntRecoverChunk";

const CHUNK_ERROR =
  /chunkloaderror|loading (?:css )?chunk [\w-]+ failed|failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|failed to load chunk/i;

/**
 * The inline script source: plain ES5 whose one input is `window`, so it can
 * run before any chunk loads.
 *
 * @param deploymentId - the build's deployment id (the commit), or `undefined`
 * @returns JavaScript for a `<script>` tag
 */
export function chunkRecoveryScript(deploymentId: string | undefined): string {
  const keyPrefix = JSON.stringify(
    `${CHUNK_RELOAD_KEY}:${deploymentId ?? "local"}:`,
  );

  return `(function(w){
var RE=${CHUNK_ERROR.toString()};
function reload(){
try{var s=w.sessionStorage,k=${keyPrefix}+w.location.pathname,last=Number(s.getItem(k));
if(last&&Date.now()-last<${CHUNK_RELOAD_WINDOW_MS.toString()})return false;
s.setItem(k,String(Date.now()));}catch(e){return false}
w.location.reload();return true}
function recover(e){var t=typeof e==="string"?e:e?e.name+" "+e.message:"";return RE.test(t)?reload():false}
w.${RECOVER_GLOBAL}=recover;
w.addEventListener("error",function(ev){var t=ev.target;
if(t&&(t.tagName==="SCRIPT"||t.tagName==="LINK")){if(String(t.src||t.href||"").indexOf("/_next/static/")!==-1)reload();return}
recover(ev.error||ev.message)},true);
w.addEventListener("unhandledrejection",function(ev){recover(ev.reason)});
})(window);`;
}

type RecoveringWindow = Window & {
  [RECOVER_GLOBAL]?: (error: unknown) => boolean;
};

/**
 * Reloads once when `error` is a chunk load failure. Used by the error
 * boundaries; the inline script defines the function.
 *
 * @returns `true` when it reloaded
 */
export function recoverFromChunkError(error: unknown): boolean {
  const recover = (window as RecoveringWindow)[RECOVER_GLOBAL];

  return recover ? recover(error) : false;
}
