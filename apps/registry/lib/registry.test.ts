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
        availability: "source",
        channel: "canary",
        compatibility: "portable-options",
        package: "@vllnt/ui-native",
        source: "src/components/button/button.tsx",
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
        availability: "source",
        channel: "canary",
        compatibility: "portable-options",
        package: "@vllnt/ui-native",
        source: "src/components/button/button.tsx",
        status: "experimental",
      },
    },
  ])("rejects inconsistent platform metadata", (component) => {
    expect(registryComponentSchema.safeParse(component).success).toBe(false);
  });
});
