import { type ClassValue, clsx } from "clsx";

import { mergeClasses } from "./tailwind-merge-config";

export function cn(...inputs: ClassValue[]) {
  return mergeClasses(clsx(inputs));
}
