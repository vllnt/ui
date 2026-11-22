import type { FlatListProps } from "react-native";

/** The FlatList props that `screenReaderListProps` sets. */
export type ScreenReaderListProps = Required<
  Pick<
    FlatListProps<unknown>,
    | "initialNumToRender"
    | "maxToRenderPerBatch"
    | "removeClippedSubviews"
    | "windowSize"
  >
>;

/**
 * Keeps every row of a short overlay list (select options, menu items,
 * shortcuts) mounted and attached, so VoiceOver and TalkBack reach each row
 * without scrolling first. FlatList otherwise mounts 10 rows and, on Android,
 * detaches rows scrolled out of view. Not for long feeds.
 */
export function screenReaderListProps(rowCount: number): ScreenReaderListProps {
  const rows = Math.max(rowCount, 1);
  return {
    initialNumToRender: rows,
    maxToRenderPerBatch: rows,
    removeClippedSubviews: false,
    windowSize: Math.max(rows, 21),
  };
}
