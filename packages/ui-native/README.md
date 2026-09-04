# @vllnt/ui-native

Accessible React Native components that share VLLNT UI semantic tokens and portable option names while using a renderer designed specifically for React Native.

> Experimental and source-only. The repository contains the renderer, but no npm release exists yet. Do not run the planned canary install command until the native manifest reports `installation.available: true`.

## Current availability

- 171 native component modules are listed in [`registry.json`](registry.json).
- `availability` is `source` and `installation.available` is `false`.
- React 19 and React Native 0.81 or newer are required.
- Android/iOS Metro export, real-device, VoiceOver, and TalkBack validation remain release gates.

The planned command after the first synchronized publication is:

```bash
pnpm add @vllnt/ui-native@canary
```

Until then, use the repository workspace and private Expo catalog for local evaluation.

## Local use

```tsx
import {
  Button,
  Card,
  CardContent,
  Heading,
  Text,
  ThemeProvider,
} from "@vllnt/ui-native";

export function Example() {
  return (
    <ThemeProvider colorScheme="system">
      <Card>
        <CardContent>
          <Heading level={2}>Native VLLNT UI</Heading>
          <Text>React Native primitives and semantic tokens.</Text>
          <Button onPress={() => {}}>Save changes</Button>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
```

The renderer includes foundation, form, data, content, AI, learning, motion, utility, control, overlay, and navigation modules. The machine-readable manifest is the authoritative inventory and classifies each module as `portable-options` or `native-adapted`.

## Renderer contract

Native APIs stay native:

- Use `onPress`, `style`, React Native accessibility roles/states/actions, safe-area adapters, and platform services.
- Use caller-owned IDs for selection and controlled/uncontrolled state where applicable.
- Inject clipboard and file-picker services; unsupported capabilities expose an explicit unavailable state.
- Respect reduced-motion preferences for animated interactions.
- Do not pass web-only props such as `className`, `onClick`, or `asChild`.

The package has no DOM, Radix UI, Tailwind CSS, NativeWind, or browser-global dependency. `@vllnt/ui` remains the stable web renderer and does not depend on this package.

## Theme

`ThemeProvider` follows the device color scheme by default. Pass `colorScheme="light"` or `colorScheme="dark"` for a fixed mode, and `override` for semantic token customization. Native-safe sRGB colors and point values are generated from `packages/design/tokens.json` through `@vllnt/ui-core`.

## Verify locally

```bash
pnpm -F @vllnt/ui-native lint
pnpm -F @vllnt/ui-native typecheck
pnpm -F @vllnt/ui-native test:once
pnpm -F @vllnt/ui-native build
pnpm -F @vllnt/ui-native boundaries:check
pnpm -F @vllnt/ui-native generate:index:check
pnpm -F @vllnt/ui-native pack:check
```

See the website's React Native hub and guide for catalog browsing, source availability, and the release boundary.
