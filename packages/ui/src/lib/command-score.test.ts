import { describe, expect, it } from "vitest";

import { commandScore } from "./command-score";

describe("commandScore", () => {
  it.each([
    { query: "Calendar", score: 1, text: "Calendar" },
    { query: "calendar", score: 0.9999, text: "Calendar" },
    { query: "cal", score: 0.989901, text: "Calendar" },
    { query: "CAL", score: 0.9898020099, text: "Calendar" },
    { query: "", score: 0.99, text: "Calendar" },
    { query: "xyz", score: 0, text: "Calendar" },
    { query: "cr", score: 0.16896564834788874, text: "Calendar" },
    { query: "clnd", score: 0.0285509512303389, text: "Calendar" },
    { query: "se", score: 0.989901, text: "Search emoji" },
    { query: "emo", score: 0.891, text: "Search emoji" },
    { query: "emoji search", score: 0, text: "Search emoji" },
    { query: "tt", score: 0.8909109000000001, text: "Toggle theme" },
    { query: "ks", score: 0.8909109000000001, text: "Keyboard shortcuts" },
    { query: "c", score: 0.1683, text: "Keyboard shortcuts" },
    { query: "sttings", score: 0.169813017, text: "Settings" },
    { query: "ings", score: 0.17, text: "Settings" },
    { query: "orf", score: 0.099, text: "Profile" },
    { query: "of", score: 0.891, text: "open-file" },
    { query: "ab", score: 0.8, text: "a_b" },
    { query: "sls", score: 0.6336, text: "src/lib/score.ts" },
    { query: "aaa", score: 0.1, text: "aa" },
  ])("scores $text against $query as cmdk 1.1.1 did", (golden) => {
    expect(commandScore(golden.text, golden.query)).toBe(golden.score);
  });

  it("matches the aliases as extra words after the label", () => {
    expect(commandScore("Toggle theme", "dark", ["dark", "light"])).toBe(0.891);
    expect(commandScore("Settings", "pref", ["preferences", "config"])).toBe(
      0.891,
    );
    expect(commandScore("Settings", "pref")).toBe(0);
  });

  it("ranks a prefix above a mid-word match and a typo below both", () => {
    const prefix = commandScore("Calendar", "cal");
    const midWord = commandScore("Local", "cal");
    const typo = commandScore("Calendar", "claender");
    expect(prefix).toBeGreaterThan(midWord);
    expect(midWord).toBeGreaterThan(typo);
  });

  it("ranks word starts above letters spread inside a word", () => {
    expect(commandScore("Toggle theme", "tt")).toBeGreaterThan(
      commandScore("Settings", "tt"),
    );
  });
});
