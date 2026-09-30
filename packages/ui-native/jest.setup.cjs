const { AccessibilityInfo } = require("react-native");

// Motion behavior is tested through injected services. Keep the default native
// preference pending so unrelated render tests cannot update after assertions.
jest
  .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
  .mockImplementation(() => new Promise(() => {}));

// Screen-reader-dependent behavior (toast expiry, marquee motion) is tested by
// overriding this spy per test; keep it pending for unrelated render tests.
jest
  .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
  .mockImplementation(() => new Promise(() => {}));
