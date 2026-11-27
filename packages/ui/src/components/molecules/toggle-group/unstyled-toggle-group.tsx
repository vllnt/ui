"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

/** Props for {@link UnstyledToggleGroup}: the Radix toggle-group root props. */
export type UnstyledToggleGroupProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Root
> & {
  ref?: React.Ref<React.ComponentRef<typeof ToggleGroupPrimitive.Root>>;
};

/** Props for {@link UnstyledToggleGroupItem}: the Radix toggle-group item props. */
export type UnstyledToggleGroupItemProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Item
> & {
  ref?: React.Ref<React.ComponentRef<typeof ToggleGroupPrimitive.Item>>;
};

/**
 * `ToggleGroup` without styles: the same Radix behaviour (roving focus, arrow
 * keys, radio items when `type` is `"single"`, else pressed buttons,
 * `disabled`) and no classes of its own. `className` reaches the element as
 * given. This module imports neither `tailwind-merge` nor
 * `class-variance-authority`, so a bundle that uses it alone carries neither.
 * The caller styles the items, for example with `data-[state=on]:` and
 * `focus-visible:` classes.
 * @example
 * <UnstyledToggleGroup aria-label="View" type="single">
 *   <UnstyledToggleGroupItem className="px-3 data-[state=on]:bg-accent" value="grid">Grid</UnstyledToggleGroupItem>
 * </UnstyledToggleGroup>
 */
const UnstyledToggleGroup = (props: UnstyledToggleGroupProps) => (
  <ToggleGroupPrimitive.Root {...props} />
);
UnstyledToggleGroup.displayName = "UnstyledToggleGroup";

/** One item of an {@link UnstyledToggleGroup}: a native `<button>` with no classes of its own. */
const UnstyledToggleGroupItem = (props: UnstyledToggleGroupItemProps) => (
  <ToggleGroupPrimitive.Item {...props} />
);
UnstyledToggleGroupItem.displayName = "UnstyledToggleGroupItem";

export { UnstyledToggleGroup, UnstyledToggleGroupItem };
