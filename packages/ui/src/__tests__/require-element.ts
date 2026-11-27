/**
 * The element `selector` matches in `root`. A test that needs the element
 * fails here, with the selector in the message, when none matches.
 */
export function requireElement(
  root: ParentNode,
  selector: string,
): HTMLElement {
  const found = root.querySelector<HTMLElement>(selector);
  if (!found) throw new Error(`No element matches "${selector}"`);
  return found;
}
