import { createContext } from "react";

/**
 * Default foreground for package `Text` rendered inside a filled surface
 * (for example a destructive banner or a primary floating action button).
 * React Native does not inherit text color across Views, so filled
 * containers provide their paired foreground token here.
 */
const textColorContext = createContext<string | undefined>(undefined);

export { textColorContext };
