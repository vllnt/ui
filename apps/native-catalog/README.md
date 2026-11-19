# VLLNT UI native catalog

Private Expo integration consumer for the experimental, source-only `@vllnt/ui-native` renderer. It exercises representative foundation, form, data, feedback, navigation, overlay, AI, learning, motion, and theme surfaces from the package barrel.

```bash
pnpm -F @vllnt/ui-native-catalog dev
pnpm -F @vllnt/ui-native-catalog lint
pnpm -F @vllnt/ui-native-catalog typecheck
pnpm -F @vllnt/ui-native-catalog test:once
pnpm -F @vllnt/ui-native-catalog build
```

The app has two views, chosen with the View buttons. **Highlights** is the representative interaction sample. **All components** renders one example of every module in `packages/ui-native/registry.json` under a heading with its registry name, so one scroll covers the device pass (iOS and Android, VoiceOver and TalkBack). The examples are the fixtures in `packages/ui-native/src/tests/accessibility-fixtures.tsx` that the accessibility contract test renders. They stay out of the npm package, which ships `dist` and metadata only. Examples that open a native modal on mount start hidden behind a **Show** button, because a list cannot show several full-screen modals at once. `all-components.test.tsx` fails when a registry entry has no fixture or another fixture opens a modal on mount.

The build exports Android and iOS JavaScript bundles in CI. This validates Expo/Metro workspace resolution without publishing or requiring a simulator. It does not replace physical Android/iOS, VoiceOver, or TalkBack validation.

`@vllnt/ui-native` is not available from npm yet. The catalog consumes repository source and must stay aligned with `packages/ui-native/registry.json` and the generated package barrel.
