import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedText, ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS } from "./animated-text";

const meta = {
  args: {
    text: "BOOTING VLLNT INTERFACE...",
  },
  component: AnimatedText,
  title: "Utility/AnimatedText",
} satisfies Meta<typeof AnimatedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Terminal: Story = {};

export const Matrix: Story = {
  args: {
    stagger: 35,
    text: "ACCESSING VECTOR MEMORY GRID",
    variant: "matrix",
  },
};

export const MatrixTerminalGrid: Story = {
  args: {
    randomCharactersPreset: "terminal",
    stagger: 30,
    text: "RENDERING CRT WIREFRAME",
    variant: "matrix",
  },
};

export const Scanline: Story = {
  args: {
    stagger: 55,
    text: "SYNCING BRAILLE SCANLINE",
    variant: "scanline",
  },
};

export const Decipher: Story = {
  args: {
    direction: "start",
    randomness: 0.75,
    stagger: 40,
    text: "FOLLOW THE WHITE RABBIT",
    variant: "decipher",
  },
};

export const DecipherReverse: Story = {
  args: {
    direction: "end",
    randomness: 0.5,
    stagger: 35,
    text: "WAKE UP NEO",
    variant: "decipher",
  },
};

export const DecipherRandom: Story = {
  args: {
    direction: "random",
    randomness: 1,
    text: "THE MATRIX HAS YOU",
    variant: "decipher",
  },
};

export const DecipherAsciiDigits: Story = {
  args: {
    randomCharacters: "01",
    randomness: 0.6,
    text: "DIGIT STREAM ONLINE",
    variant: "decipher",
  },
};

export const DecipherTerminalBoxes: Story = {
  args: {
    direction: "center-out",
    randomCharactersPreset: "terminal",
    randomness: 0.8,
    text: "DRAWING SECURE CHANNEL",
    variant: "decipher",
  },
};

export const DecipherBlockNoise: Story = {
  args: {
    direction: "random",
    randomCharactersPreset: "blocks",
    randomness: 1,
    text: "SIGNAL RECOVERY IN PROGRESS",
    variant: "decipher",
  },
};

export const DecipherUnicodeSigils: Story = {
  args: {
    randomCharacters: `${ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS.symbols}${ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS.terminal}`,
    direction: "end",
    randomness: 0.9,
    text: "GLYPH MAP SYNCHRONIZED",
    variant: "decipher",
  },
};

export const Typewriter: Story = {
  args: {
    stagger: 45,
    text: "LOAD PROGRAM // READY",
    variant: "typewriter",
  },
};

export const Reveal: Story = {
  args: {
    splitBy: "word",
    stagger: 70,
    text: "Ship motion that still feels like the current system.",
    variant: "reveal",
  },
};
