/**
 * Gives a component its `displayName` and, for a compound component, its
 * statics. Put the `@__PURE__` annotation comment right before the call, as in
 * `const Card = <annotation> named("Card", (props) => <div />)`.
 *
 * The annotation lets a bundler drop `Card` when nothing imports it. A bare
 * `Card.displayName = "Card"` statement does the opposite: it keeps `Card` and
 * everything it uses in every bundle that loads the module.
 *
 * Every argument has to be something webpack counts as pure: a literal, an
 * identifier or a function. An object literal is not, and one in the call makes
 * webpack ignore the annotation, so the statics come as a function.
 *
 * @param displayName - The name React DevTools, tests and slot lookups read.
 * @param component - The component, which this call changes in place.
 * @param statics - Returns the compound parts to hang on the component, as in
 *   `() => ({ List: TabsList })` for `Tabs.List`.
 * @returns the same component, typed with its `displayName` and statics.
 */
export function named<TComponent extends object>(
  displayName: string,
  component: TComponent,
): TComponent & { displayName: string };
export function named<TComponent extends object, TStatics extends object>(
  displayName: string,
  component: TComponent,
  statics: () => TStatics,
): TComponent & TStatics & { displayName: string };
export function named(
  displayName: string,
  component: object,
  statics?: () => object,
): object {
  return Object.assign(component, statics?.(), { displayName });
}
