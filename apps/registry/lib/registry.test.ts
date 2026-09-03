import { describe, expect, it } from "vitest";

import { registryComponentSchema } from "./registry";

const baseComponent = {
  files: [
    { path: "registry/default/button/button.tsx", type: "registry:component" },
  ],
  name: "button",
  platforms: ["web"] as const,
  title: "Button",
  type: "registry:component" as const,
};

describe("registry component platforms", () => {
  it("accepts a web-only descriptor", () => {
    expect(registryComponentSchema.parse(baseComponent).platforms).toEqual([
      "web",
    ]);
  });

  it("accepts matching experimental native metadata and examples", () => {
    const parsed = registryComponentSchema.parse({
      ...baseComponent,
      examples: [
        {
          code: 'import { Button } from "@vllnt/ui-native";',
          framework: "react-native",
          title: "Native button",
        },
      ],
      native: {
        channel: "canary",
        package: "@vllnt/ui-native",
        parity: "full",
        status: "experimental",
      },
      platforms: ["web", "native"],
    });

    expect(parsed.native?.package).toBe("@vllnt/ui-native");
    expect(parsed.examples?.[0]?.framework).toBe("react-native");
  });

  it.each([
    { ...baseComponent, platforms: [] },
    { ...baseComponent, platforms: ["web", "web"] },
    { ...baseComponent, platforms: ["desktop"] },
    { ...baseComponent, platforms: ["web", "native"] },
    {
      ...baseComponent,
      native: {
        channel: "canary",
        package: "@vllnt/ui-native",
        parity: "full",
        status: "experimental",
      },
    },
  ])("rejects inconsistent platform metadata", (component) => {
    expect(registryComponentSchema.safeParse(component).success).toBe(false);
  });
});
