import { useState } from "react";

import { Button, Heading, Text, useTheme } from "@vllnt/ui-native";
import { View } from "react-native";

import {
  type AccessibilityFixture,
  accessibilityFixtures,
} from "../../packages/ui-native/src/tests/accessibility-fixtures";

import { nativeComponentNames } from "./catalog-metadata";

/**
 * Fixtures that open a native modal as soon as they mount. A scrolling list
 * cannot show full-screen modals together, so each of these starts hidden
 * behind a Show button. The catalog test fails when another fixture opens a
 * modal on mount.
 */
const modalFixtureNames: ReadonlySet<string> = new Set([
  "alert-dialog",
  "command",
  "completion-dialog",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "keyboard-shortcuts-help",
  "menubar",
  "model-selector",
  "popover",
  "search-dialog",
  "share-dialog",
  "sheet",
  "slideshow",
  "tooltip",
]);

/** Test id of the block that holds one component's heading and fixture. */
export function entryTestId(name: string) {
  return `component-${name}`;
}

function fixtureFor(name: string): AccessibilityFixture {
  const fixture = accessibilityFixtures[name];
  if (!fixture) {
    throw new Error(`Native component "${name}" has no accessibility fixture.`);
  }
  return fixture;
}

function ComponentEntry({
  fixture,
  name,
}: {
  readonly fixture: AccessibilityFixture;
  readonly name: string;
}) {
  const theme = useTheme();
  const opensModal = modalFixtureNames.has(name);
  const [mounted, setMounted] = useState(!opensModal);

  return (
    <View style={{ gap: theme.spacing[2] }} testID={entryTestId(name)}>
      <Heading level={3} size={5}>
        {name}
      </Heading>
      {opensModal ? (
        <Button
          onPress={() => {
            setMounted((value) => !value);
          }}
          size="sm"
          variant="outline"
        >
          {`${mounted ? "Hide" : "Show"} ${name}`}
        </Button>
      ) : null}
      {mounted ? fixture() : null}
    </View>
  );
}
ComponentEntry.displayName = "ComponentEntry";

/** One example of every native component in the registry, in registry order. */
export function AllComponentsSection() {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing[6] }}>
      <View style={{ gap: theme.spacing[2] }}>
        <Heading level={2} size={4}>
          All components
        </Heading>
        <Text tone="muted">
          {nativeComponentNames.length} examples, one for each native module.
          Examples that open a modal start hidden; use their Show button.
        </Text>
      </View>
      {nativeComponentNames.map((name) => (
        <ComponentEntry fixture={fixtureFor(name)} key={name} name={name} />
      ))}
    </View>
  );
}
AllComponentsSection.displayName = "AllComponentsSection";
