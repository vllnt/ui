import { type ClassValue, cx } from "./cx";
import { mergeClasses } from "./tailwind-merge-config";

export function cn(...inputs: ClassValue[]) {
  return mergeClasses(cx(inputs));
}
