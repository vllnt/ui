/**
 * Sonner's imperative `toast()` API, re-exported by the components barrel.
 *
 * `sonner` injects its stylesheet on import, so a bundler keeps every module
 * that imports it. The barrel re-exports `toast` from this side-effect-free
 * module instead of from `sonner` directly: bundles that never use `toast` or
 * `Toaster` drop sonner.
 */
export { toast } from "sonner";
