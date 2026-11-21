/** An item paired with a React key that survives edits to other items. */
export type OccurrenceKeyed<TItem> = {
  readonly item: TItem;
  readonly key: string;
};

/**
 * Keys items that have no id and may repeat, such as labels, tags or
 * transcript lines. A key is the item's identity text plus the number of
 * identical items before it, so an equal item keeps its key when others are
 * inserted or removed around it, and two equal items never share a key.
 *
 * @param items - items to key, in render order.
 * @param identity - text that makes two items "the same", for example a label.
 * @returns each item with its React key.
 */
export function keyByOccurrence<TItem>(
  items: readonly TItem[],
  identity: (item: TItem) => string,
): readonly OccurrenceKeyed<TItem>[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const text = identity(item);
    const occurrence = seen.get(text) ?? 0;
    seen.set(text, occurrence + 1);
    return { item, key: `${text}-${occurrence.toString()}` };
  });
}
