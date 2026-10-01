# @vllnt/ui-native

Accessible React Native components that share VLLNT UI semantic tokens and portable option names while using a renderer designed specifically for React Native.

> Experimental and source-only. The repository contains the renderer. A manually bootstrapped pre-release (`0.1.0-canary.20260917105553.sha7466647a4ba5`) exists on npm only to reserve the package name; it has no build provenance, npm's `latest` tag points at it, and it is not a supported install. Do not run the planned canary install command until the native manifest reports `installation.available: true`.

The package base is **0.1.0**, not a published stable release. Core and Native canaries use the same `0.1.0-canary.<run>.sha<commit>` version and an exact core dependency. Workflow publication is unconditionally disabled pending a separate hardening/enabling review; the stable promotion hold also remains. See [releasing](../../docs/RELEASING.md). Neither merge nor passing local tests authorizes enabling Native publication.

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
