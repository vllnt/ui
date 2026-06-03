import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LangProvider } from "./lang-provider";

let mockPathname = "/en/docs";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("LangProvider", () => {
  afterEach(() => {
    mockPathname = "/en/docs";
    document.documentElement.removeAttribute("lang");
  });

  it("sets the document language from a supported pathname prefix", async () => {
    mockPathname = "/fr/components/button";

    render(<LangProvider />);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("lang", "fr");
    });
  });

  it("uses the default language when the pathname has no locale prefix", async () => {
    mockPathname = "/components/button";

    render(<LangProvider defaultLanguage="fr" />);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("lang", "fr");
    });
  });

  it("ignores unsupported locale prefixes", async () => {
    mockPathname = "/de/components/button";

    render(<LangProvider defaultLanguage="en" supportedLanguages={["en"]} />);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("lang", "en");
    });
  });
});
