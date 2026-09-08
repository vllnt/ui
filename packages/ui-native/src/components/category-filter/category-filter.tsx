import type { Ref } from "react";
import type { View } from "react-native";

import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import {
  SegmentedControl,
  type SegmentedControlItem,
} from "../segmented-control/segmented-control";

/** Props for a compact native category filter. */
export type CategoryFilterProps = {
  readonly categories: readonly SegmentedControlItem[];
  readonly disabled?: boolean;
  readonly label: string;
  readonly ref?: Ref<View>;
  readonly selection: ControllableStateOptions<string>;
};

/** Single-choice category filter rendered as a native segmented control. */
function CategoryFilter({ categories, ref, ...props }: CategoryFilterProps) {
  return <SegmentedControl {...props} items={categories} ref={ref} />;
}
CategoryFilter.displayName = "CategoryFilter";

export { CategoryFilter };
