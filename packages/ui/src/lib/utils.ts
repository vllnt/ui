import { mergeClasses } from "./tailwind-merge-config";
import { type ClassValue, cx } from "./variants";

export function cn(...inputs: ClassValue[]) {
  return mergeClasses(cx(inputs));
}
