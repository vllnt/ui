/** String or number identity suitable for native selection state and list keys. */
export type SelectionKey = number | string;

/** Extracts a caller-owned stable key from an item. */
export type SelectionKeyExtractor<TItem, TKey extends SelectionKey> = (
  item: TItem,
) => TKey;

/** Returns whether an item is the current single selection. */
function isSingleSelected<TItem, TKey extends SelectionKey>(
  selectedKey: TKey | undefined,
  item: TItem,
  getKey: SelectionKeyExtractor<TItem, TKey>,
): boolean {
  return selectedKey !== undefined && Object.is(selectedKey, getKey(item));
}

/** Selects an item and preserves the existing key when it does not change. */
function selectSingle<TItem, TKey extends SelectionKey>(
  selectedKey: TKey | undefined,
  item: TItem,
  getKey: SelectionKeyExtractor<TItem, TKey>,
): TKey {
  const key = getKey(item);
  return selectedKey !== undefined && Object.is(selectedKey, key)
    ? selectedKey
    : key;
}

/** Returns whether an item is present in a selection key set. */
function isMultipleSelected<TItem, TKey extends SelectionKey>(
  selectedKeys: ReadonlySet<TKey>,
  item: TItem,
  getKey: SelectionKeyExtractor<TItem, TKey>,
): boolean {
  return selectedKeys.has(getKey(item));
}

/**
 * Adds or removes an item's caller-owned key, preserving the input set when
 * the requested state is already represented.
 */
function setMultipleSelected<TItem, TKey extends SelectionKey>(
  ...[selectedKeys, item, selected, getKey]: readonly [
    ReadonlySet<TKey>,
    TItem,
    boolean,
    SelectionKeyExtractor<TItem, TKey>,
  ]
): ReadonlySet<TKey> {
  const key = getKey(item);
  if (selectedKeys.has(key) === selected) return selectedKeys;

  const nextKeys = new Set(selectedKeys);
  if (selected) nextKeys.add(key);
  else nextKeys.delete(key);
  return nextKeys;
}

/** Toggles an item's caller-owned key in a selection set. */
function toggleMultipleSelected<TItem, TKey extends SelectionKey>(
  selectedKeys: ReadonlySet<TKey>,
  item: TItem,
  getKey: SelectionKeyExtractor<TItem, TKey>,
): ReadonlySet<TKey> {
  const key = getKey(item);
  const nextKeys = new Set(selectedKeys);
  if (nextKeys.has(key)) nextKeys.delete(key);
  else nextKeys.add(key);
  return nextKeys;
}

export {
  isMultipleSelected,
  isSingleSelected,
  selectSingle,
  setMultipleSelected,
  toggleMultipleSelected,
};
