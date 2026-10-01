import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS,
  AnimatedText,
} from "./animated-text";

describe("AnimatedText", () => {
  it("renders the full accessible label in terminal mode by default with a cursor", () => {
    render(<AnimatedText text="Motion without noise" />);
    expect(screen.getByLabelText("Motion without noise")).toBeVisible();
    expect(screen.getByText("█")).toBeInTheDocument();
  });

  it("supports reveal mode word splitting", () => {
    render(
      <AnimatedText splitBy="word" text="Hello world again" variant="reveal" />,
    );
    expect(screen.getAllByText(/Hello|world|again/)).toHaveLength(3);
  });

  it.each([
    { name: "matrix mode", props: { text: "ABC", variant: "matrix" } },
    {
      name: "decipher mode",
      props: {
        direction: "random",
        randomCharacters: "01",
        randomness: 1,
        text: "DECRYPT",
        variant: "decipher",
      },
    },
    {
      name: "terminal pseudo-graphic presets",
      props: {
        randomCharactersPreset: "terminal",
        text: "CRT GRID",
        variant: "matrix",
      },
    },
    {
      name: "multi-byte unicode glyphs in custom random pools",
      props: {
        randomCharacters: `${ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS.blocks}◢◣◤◥`,
        text: "GLYPH",
        variant: "decipher",
      },
    },
  ] as const)("supports $name", ({ props }) => {
    render(<AnimatedText {...props} />);
    expect(screen.getByLabelText(props.text)).toBeVisible();
  });

  it("loads and splits by code point without Intl.Segmenter", async () => {
    const { Segmenter } = Intl;
    Reflect.deleteProperty(Intl, "Segmenter");
    vi.resetModules();
    try {
      const module = await import("./animated-text");
      render(
        <module.AnimatedText
          splitBy="character"
          text="a😀b"
          variant="reveal"
        />,
      );
      expect(screen.getByLabelText("a😀b")).toBeVisible();
      expect(screen.getByText("😀")).toBeInTheDocument();
    } finally {
      Object.defineProperty(Intl, "Segmenter", {
        configurable: true,
        value: Segmenter,
        writable: true,
      });
    }
  });
});
