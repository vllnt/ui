import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalendarFallback } from "./calendar-fallback";

afterEach(() => {
  vi.unstubAllGlobals();
});

// The placeholder shows while a calendar loads, which can happen during a
// server render, where there is no document to read the page language from.
describe("CalendarFallback on the server", () => {
  it("renders the weeks of the month without a document", () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- stubbing a global as missing needs the value
    vi.stubGlobal("document", undefined);
    const html = renderToString(
      <CalendarFallback month={new Date(2026, 10, 1)} />,
    );
    // One header row and the five weeks of November 2026.
    expect(html.match(/<tr/g)).toHaveLength(1 + 5);
  });
});
