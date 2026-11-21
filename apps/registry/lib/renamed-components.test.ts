import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import registryData from "@/registry.json";

import componentSlugs from "./component-slugs.json";
import { registry } from "./registry";
import {
  RENAMED_COMPONENTS,
  renamedComponentPathname,
  renamedComponentRedirect,
} from "./renamed-components";

describe("renamedComponentPathname", () => {
  it.each([
    ["/components/jarvis-dock", "/components/command-dock"],
    ["/fr/components/jarvis-dock", "/fr/components/command-dock"],
    ["/en/components/jarvis-dock", "/en/components/command-dock"],
  ])("maps %s to %s", (pathname, expected) => {
    expect(renamedComponentPathname(pathname)).toBe(expected);
  });

  it.each([
    "/components/command-dock",
    "/components/button",
    "/components/constructor",
    "/components/Jarvis-Dock",
    "/components/jarvis-dock/playground",
    "/components",
    "/docs/jarvis-dock",
    "/",
  ])("leaves %s alone", (pathname) => {
    expect(renamedComponentPathname(pathname)).toBeUndefined();
  });
});

describe("renamedComponentRedirect", () => {
  it.each([
    [
      "http://localhost:3000/components/jarvis-dock",
      "http://localhost:3000/components/command-dock",
    ],
    [
      "http://localhost:3000/fr/components/jarvis-dock",
      "http://localhost:3000/fr/components/command-dock",
    ],
    [
      "http://localhost:3000/components/jarvis-dock?platform=web",
      "http://localhost:3000/components/command-dock?platform=web",
    ],
  ])("answers %s with a permanent redirect to %s", (from, to) => {
    const response = renamedComponentRedirect(new NextRequest(from));

    expect(response?.status).toBe(308);
    expect(response?.headers.get("location")).toBe(to);
  });

  it("does not answer a request for any other page", () => {
    expect(
      renamedComponentRedirect(
        new NextRequest("http://localhost:3000/components/command-dock"),
      ),
    ).toBeUndefined();
  });
});

describe("deprecated registry alias of a renamed component", () => {
  const items = new Map(registryData.items.map((item) => [item.name, item]));
  const listed = registry.items.map((item) => item.name);

  it.each([...RENAMED_COMPONENTS])(
    "%s stays installable, deprecated, and points at the files of %s",
    (oldName, newName) => {
      const alias = items.get(oldName);
      const current = items.get(newName);

      expect(alias?.stability).toBe("deprecated");
      expect(alias?.replacedBy).toBe(newName);
      expect(current?.stability).toBe("stable");
      expect(alias?.files).toEqual(current?.files);
    },
  );

  it.each([...RENAMED_COMPONENTS])(
    "%s is not listed, counted or given a slug next to %s",
    (oldName, newName) => {
      expect(listed).not.toContain(oldName);
      expect(listed).toContain(newName);
      expect(componentSlugs).not.toContain(oldName);
      expect(componentSlugs).toContain(newName);
    },
  );
});
