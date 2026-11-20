# @vllnt/ui-native

Accessible React Native components that share VLLNT UI semantic tokens and portable option names while using a renderer designed specifically for React Native.

## Install

```bash
pnpm add @vllnt/ui-native@canary @vllnt/ui-core@canary
```

`@vllnt/ui-native` pins the exact `@vllnt/ui-core` version it was built with. Peers: `react >=19.1.0 <20` and `react-native >=0.81.0 <1`. It works in Expo; the private catalog app in `apps/native-catalog` is the reference consumer.

- `canary` is published from every native change on `main` as `<next>-canary.<run>.sha<commit>`. It is the supported install today.
- Stable releases are published from `ui-native-vX.Y.Z` tags by `native-release.yml`, with npm provenance, and move `latest`. Until the first one, `latest` points at an old name-reservation build: do not install it.

Every canary pair is validated from the npm tarballs before it counts: a clean Expo app and a copy of the catalog install it (with the 7-day package-age gate), typecheck, run the Jest and accessibility suites, and export for iOS and Android. See [releasing](../../docs/RELEASING.md).

## Current availability

- 175 native component modules are listed in [`registry.json`](registry.json). [`docs/native/PARITY.md`](../../docs/native/PARITY.md) maps every web component to its native status and lists the documented props gaps.
- Every interactive component uses `InteractivePressable` (rest, hover, focus-visible, pressed, selected and disabled from one state set, a 44-point minimum target, and a non-colour selected border), and every animation respects reduced motion.
- Validation is Jest plus Metro exports. Real-device, VoiceOver and TalkBack passes are not yet part of the release gate.

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

## Source organization

- `src/components/<level>/<name>/<name>.tsx`: kebab-case component folders grouped by Atomic Design level (`atoms`, `molecules`, `organisms`), matching Web; component-specific helpers and unit tests belong beside the implementation (for example, `atoms/button/button-styles.ts`). Levels and import rules are in [COMPONENTS.md](../../docs/agents/COMPONENTS.md#react-native-vllntui-native); `pnpm -F @vllnt/ui-native check:atomic` enforces them.
- `src/primitives/`: shared Native interaction, platform-service, selection, and motion utilities, with their colocated tests. They sit below atoms and never import a component.
- `src/theme/`: Native theme provider; portable tokens remain in `@vllnt/ui-core`. Like primitives, it never imports a component.
- `src/tests/`: cross-component family and integration suites, named for their contracts rather than review batches.
- `src/index.ts`: generated public exports. No extra folder barrels or public import changes are required.

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

Browse the [Native component catalog](https://ui.vllnt.com/components?platform=native) and switch to Native on the [unified installation guide](https://ui.vllnt.com/docs/installation?platform=native) for source availability and the release boundary.
