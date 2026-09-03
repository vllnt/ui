# @vllnt/ui-native

Accessible React Native components using the same semantic tokens and portable option contracts as `@vllnt/ui`, with a renderer designed specifically for React Native.

> Experimental. Install from the `canary` tag. Stable publishing is intentionally disabled while the API is validated in real Expo applications.

## Install

```bash
pnpm add @vllnt/ui-native@canary
```

React 19 and React Native 0.81 or newer are required peer dependencies.

## Use

```tsx
import { Button, Card, CardContent, Text, ThemeProvider } from "@vllnt/ui-native";

export function Example() {
  return (
    <ThemeProvider colorScheme="system">
      <Card>
        <CardContent>
          <Text>Native VLLNT UI</Text>
          <Button onPress={() => {}}>Save changes</Button>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
```

The pilot includes `Button`, `Text`, `Heading`, `Badge`, and the compound `Card` family. `Button` accepts a string or numeric label so every variant can apply its accessible foreground color; richer icon/content composition is intentionally deferred. The renderer uses React Native primitives and `StyleSheet`; it does not depend on the DOM renderer, Radix UI, Tailwind CSS, NativeWind, or web globals.

The `ThemeProvider` follows the device color scheme by default. Pass `colorScheme="light"` or `colorScheme="dark"` for a fixed mode, and `override` for semantic token customization.
