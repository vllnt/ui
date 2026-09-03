import { useState } from "react";

import {
  Heading,
  Text,
  ThemeProvider,
  type ThemeSelection,
  useTheme,
} from "@vllnt/ui-native";
import { StatusBar } from "expo-status-bar";
import { ScrollView, View } from "react-native";

import {
  BadgeSection,
  ButtonSection,
  CardSection,
  ThemeSection,
  TypeSection,
} from "./catalog-sections";

function CatalogContent({
  onThemeChange,
  themeSelection,
}: {
  readonly onThemeChange: (selection: ThemeSelection) => void;
  readonly themeSelection: ThemeSelection;
}) {
  const theme = useTheme();
  const [presses, setPresses] = useState(0);
  const incrementPresses = () => {
    setPresses((value) => value + 1);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.colors.background }}
    >
      <StatusBar style={theme.colorScheme === "dark" ? "light" : "dark"} />
      <View
        style={{
          gap: theme.spacing[8],
          paddingBottom: theme.spacing[16],
          paddingHorizontal: theme.spacing[4],
          paddingTop: theme.spacing[12],
        }}
      >
        <View style={{ gap: theme.spacing[2] }}>
          <Heading level={1} size={2}>
            VLLNT UI Native
          </Heading>
          <Text tone="muted">
            Shared tokens and contracts. React Native renderer.
          </Text>
        </View>
        <ThemeSection onChange={onThemeChange} selection={themeSelection} />
        <ButtonSection onPress={incrementPresses} presses={presses} />
        <TypeSection />
        <BadgeSection />
        <CardSection onPress={incrementPresses} />
      </View>
    </ScrollView>
  );
}
CatalogContent.displayName = "CatalogContent";

export default function App() {
  const [themeSelection, setThemeSelection] =
    useState<ThemeSelection>("system");

  return (
    <ThemeProvider colorScheme={themeSelection}>
      <CatalogContent
        onThemeChange={setThemeSelection}
        themeSelection={themeSelection}
      />
    </ThemeProvider>
  );
}
