"use client";

import {
  type Ref,
  type RefCallback,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";

import type { View } from "react-native";

import { useMergedReferences } from "./merge-references";
import { type RovingOrientation, rovingTarget } from "./roving-focus";

/** Options for {@link RovingGroup.move}. */
export type RovingMoveOptions<TKey> = {
  /** Wrap from the last item to the first, and back. */
  readonly loop: boolean;
  /**
   * Item keys in display order. Leave it out to use mount order, which fits
   * until an item mounts after its siblings and belongs before them.
   */
  readonly order?: readonly TKey[];
  /** Restricts the arrow keys to one axis; both axes work when omitted. */
  readonly orientation?: RovingOrientation;
};

/** The items of one keyboard-navigable group. Items join through {@link useRovingItem}. */
export type RovingGroup<TKey> = {
  /** Remembers the host view of an item; the returned function forgets it. */
  readonly attach: (key: TKey, node: View) => () => void;
  /** Adds an item to the mount order; the returned function removes it. */
  readonly join: (key: TKey) => () => void;
  /**
   * Moves focus for a key press on the item `from`.
   *
   * @param from - Key of the item that has focus.
   * @param pressedKey - The pressed key, as in `KeyboardEvent.key`.
   * @param options - Wrap rule, axis and optional display order.
   * @returns The key of the item that took focus, or `undefined` when focus stayed.
   */
  move(
    from: TKey,
    pressedKey: string,
    options: RovingMoveOptions<TKey>,
  ): TKey | undefined;
  /** Marks an item as skipped by arrow keys; the returned function undoes it. */
  readonly skip: (key: TKey) => () => void;
};

function remember<TKey>(keys: Set<TKey>, key: TKey): () => void {
  keys.add(key);
  return () => {
    keys.delete(key);
  };
}

function createRovingGroup<TKey>(): RovingGroup<TKey> {
  const nodes = new Map<TKey, View>();
  const skipped = new Set<TKey>();
  const mountOrder = new Set<TKey>();
  return {
    attach(key, node) {
      nodes.set(key, node);
      return () => {
        nodes.delete(key);
      };
    },
    join: (key) => remember(mountOrder, key),
    move(from, pressedKey, { loop, order, orientation }) {
      const keys = order ?? [...mountOrder];
      const target = rovingTarget({
        current: keys.indexOf(from),
        enabled: keys.map((key) => nodes.has(key) && !skipped.has(key)),
        key: pressedKey,
        loop,
        orientation,
      });
      const targetKey = target === undefined ? undefined : keys[target];
      if (targetKey !== undefined) nodes.get(targetKey)?.focus();
      return targetKey;
    },
    skip: (key) => remember(skipped, key),
  };
}

/**
 * Creates the registry a roving-focus group keeps for its items. The group
 * owns the registry; each item joins it with {@link useRovingItem}.
 *
 * @returns A stable registry with a `move` function that focuses the target item.
 * @example
 * const group = useRovingGroup<string>();
 */
export function useRovingGroup<TKey>(): RovingGroup<TKey> {
  return useMemo(() => createRovingGroup<TKey>(), []);
}

/** Inputs of {@link useRovingItem}. */
export type RovingItemOptions<TKey> = {
  /** Whether arrow keys skip this item. */
  readonly disabled: boolean;
  /** The registry from {@link useRovingGroup}. */
  readonly group: RovingGroup<TKey>;
  /** Stable key of this item. */
  readonly itemKey: TKey;
  /** The caller's own ref, kept working. */
  readonly reference?: Ref<View>;
};

/**
 * Joins an item to its group's registry so arrow keys can focus it.
 *
 * @param options - The group, the item key, whether to skip it and the caller's ref.
 * @returns A ref callback to put on the item's host view.
 * @example
 * const ref = useRovingItem({ disabled, group, itemKey: value, reference: props.ref });
 */
export function useRovingItem<TKey>({
  disabled,
  group,
  itemKey,
  reference,
}: RovingItemOptions<TKey>): RefCallback<View> {
  useLayoutEffect(() => group.join(itemKey), [group, itemKey]);
  useLayoutEffect(
    () => (disabled ? group.skip(itemKey) : undefined),
    [disabled, group, itemKey],
  );
  const track = useCallback(
    (node: null | View) =>
      node === null ? undefined : group.attach(itemKey, node),
    [group, itemKey],
  );
  return useMergedReferences(track, reference);
}
