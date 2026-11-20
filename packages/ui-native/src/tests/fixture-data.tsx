import { Text, View } from "react-native";

import type { IconGlyphProps } from "../components/atoms/icon/icon";
import type { SearchDialogLabels } from "../components/atoms/search-dialog/search-dialog";

// Fixture data without a Testing Library import: the accessibility fixtures
// use it, and the Expo catalog bundles those fixtures. `test-utils.tsx`
// re-exports it for the Jest tests.

/** Square drawn with a `View`: a stand-in for a lucide icon, which ui-native does not bundle. */
export function SquareGlyph({ color, size }: IconGlyphProps) {
  return (
    <View
      style={{ backgroundColor: color, height: size, width: size }}
      testID="glyph"
    />
  );
}

/** Code/Preview tabs whose panels render "<label> panel". */
export const codePreviewTabs = [
  { label: "Code", panel: <Text>Code panel</Text>, value: "code" },
  { label: "Preview", panel: <Text>Preview panel</Text>, value: "preview" },
];

/** SearchDialog labels that name each result by its title. */
export const searchLabels: SearchDialogLabels = {
  clear: "Clear",
  close: "Close",
  componentsGroup: "Components",
  docsEmpty: "No docs",
  docsGroup: "Docs",
  empty: "No results",
  minimumDocsQuery: (minimum) => `Type ${minimum}`,
  open: "Open search",
  result: (item) => item.title,
  scope: "Scope",
  scopeOption: {
    components: "Components only",
    docs: "Docs only",
    everything: "Everything",
  },
  searchingDocs: "Searching docs",
  searchPlaceholder: "Search",
  title: "Search docs",
};

/** Grid/List view-switcher options whose panels render "<label> panel". */
export const gridListOptions = [
  { key: "grid", label: "Grid", panel: <Text>Grid panel</Text> },
  { key: "list", label: "List", panel: <Text>List panel</Text> },
];
