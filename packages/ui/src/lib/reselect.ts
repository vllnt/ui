/** Options for {@link reselectProps}. */
type ReselectOptions = {
  /** Also report Enter and Space, for items that are not native buttons. */
  keyboard?: boolean;
};

/**
 * ui-sdk ignores a press on the item that is already selected: the value does
 * not change, so no `onValueChange` runs. Radix reported it, and so did this
 * library before ui-sdk. Merge the result into the selected item's props to
 * keep reporting that press through `onReselect`. Without `onReselect` there
 * is nothing to merge.
 */
export function reselectProps(
  onReselect: (() => void) | undefined,
  { keyboard = false }: ReselectOptions = {},
): Record<string, unknown> {
  if (!onReselect) {
    return {};
  }

  return {
    onClick: onReselect,
    ...(keyboard
      ? {
          onKeyDown: (event: { key: string }) => {
            if (event.key === "Enter" || event.key === " ") {
              onReselect();
            }
          },
        }
      : {}),
  };
}
