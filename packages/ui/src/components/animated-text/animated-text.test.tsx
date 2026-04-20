import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS,
  AnimatedText,
} from "./animated-text";

describe("AnimatedText", () => {
  it("renders the full accessible label", () => {
    render(<AnimatedText text="Motion without noise" />);

    expect(screen.getByLabelText("Motion without noise")).toBeVisible();
  });

  it("uses terminal mode by default with a cursor", () => {
    render(<AnimatedText text="ABC" />);

    expect(screen.getByText("█")).toBeInTheDocument();
  });

  it("supports reveal mode word splitting", () => {
    render(
      <AnimatedText splitBy="word" text="Hello world again" variant="reveal" />,
    );

    expect(screen.getAllByText(/Hello|world|again/)).toHaveLength(3);
  });

  it("supports matrix mode", () => {
    render(<AnimatedText text="ABC" variant="matrix" />);

    expect(screen.getByLabelText("ABC")).toBeVisible();
  });

  it("supports the unicode scanline variant", () => {
    render(<AnimatedText text="ABC" variant="scanline" />);

    expect(screen.getByLabelText("ABC")).toBeVisible();
  });

  it("supports decipher mode", () => {
    render(
      <AnimatedText
        direction="random"
        randomCharacters="01"
        randomness={1}
        text="DECRYPT"
        variant="decipher"
      />,
    );

    expect(screen.getByLabelText("DECRYPT")).toBeVisible();
  });

  it("supports terminal pseudo-graphic presets", () => {
    render(
      <AnimatedText
        randomCharactersPreset="terminal"
        text="CRT GRID"
        variant="matrix"
      />,
    );

    expect(screen.getByLabelText("CRT GRID")).toBeVisible();
  });

  it("preserves multi-byte unicode glyphs in custom random pools", () => {
    render(
      <AnimatedText
        randomCharacters={`${ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS.blocks}◢◣◤◥`}
        text="GLYPH"
        variant="decipher"
      />,
    );

    expect(screen.getByLabelText("GLYPH")).toBeVisible();
  });
});
