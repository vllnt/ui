const { AccessibilityInfo } = require("react-native");

// Motion behavior is tested through injected services. Keep the default native
// preference pending so unrelated render tests cannot update after assertions.
jest
  .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
  .mockImplementation(() => new Promise(() => {}));
