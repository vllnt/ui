import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LangProvider } from "./lang-provider";

let mockPathname = "/en/docs";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("LangProvider", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("lang");
    mockPathname = "/en/docs";
  });

  it.each([
    {
      element: <LangProvider />,
      lang: "fr",
      name: "from a supported pathname prefix",
      pathname: "/fr/components/button",
    },
    {
      element: <LangProvider defaultLanguage="fr" />,
      lang: "fr",
      name: "from the default language when the pathname has no locale prefix",
      pathname: "/components/button",
    },
    {
      element: (
        <LangProvider defaultLanguage="en" supportedLanguages={["en"]} />
      ),
      lang: "en",
      name: "ignoring unsupported locale prefixes",
      pathname: "/de/components/button",
    },
  ])(
    "sets the document language $name",
    async ({ element, lang, pathname }) => {
      mockPathname = pathname;
      render(element);
      await waitFor(() => {
        expect(document.documentElement).toHaveAttribute("lang", lang);
      });
    },
  );
});
