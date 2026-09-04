# VLLNT UI native catalog

Private Expo integration consumer for the experimental, source-only `@vllnt/ui-native` renderer. It exercises representative foundation, form, data, feedback, navigation, overlay, AI, learning, motion, and theme surfaces from the package barrel.

```bash
pnpm -F @vllnt/ui-native-catalog dev
pnpm -F @vllnt/ui-native-catalog lint
pnpm -F @vllnt/ui-native-catalog typecheck
pnpm -F @vllnt/ui-native-catalog test:once
pnpm -F @vllnt/ui-native-catalog build
```

The build exports Android and iOS JavaScript bundles in CI. This validates Expo/Metro workspace resolution without publishing or requiring a simulator. It does not replace physical Android/iOS, VoiceOver, or TalkBack validation.

`@vllnt/ui-native` is not available from npm yet. The catalog consumes repository source and must stay aligned with `packages/ui-native/registry.json` and the generated package barrel.
