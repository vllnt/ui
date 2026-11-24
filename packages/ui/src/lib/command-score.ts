/*!
 * Port of `commandScore` from cmdk 1.1.1 (https://github.com/pacocoursey/cmdk),
 * Copyright (c) 2022 Paco Coursey, MIT License. The full licence text lives in
 * `command-score.LICENSE` next to this file. The port keeps every constant and
 * the order of every multiplication, so scores equal cmdk's score for score.
 */

const SCORE_CONTINUE_MATCH = 1;
const SCORE_SPACE_WORD_JUMP = 0.9;
const SCORE_NON_SPACE_WORD_JUMP = 0.8;
const SCORE_CHARACTER_JUMP = 0.17;
const SCORE_TRANSPOSITION = 0.1;
const PENALTY_SKIPPED = 0.999;
const PENALTY_CASE_MISMATCH = 0.9999;
const PENALTY_NOT_COMPLETE = 0.99;

const GAP = /[\\/_+.#"@[({&]/;
const GAPS = /[\\/_+.#"@[({&]/g;
const SPACE = /[\s-]/;
const SPACES = /[\s-]/g;

type Match = {
  abbreviation: string;
  lowerAbbreviation: string;
  lowerText: string;
  memo: Map<string, number>;
  text: string;
};

type Cursor = { abbreviationIndex: number; stringIndex: number };

type Candidate = { cursor: Cursor; high: number; index: number };

type Jump = { from: number; index: number; score: number };

const foldSpaces = (value: string): string =>
  value.toLowerCase().replaceAll(SPACES, " ");

function skip(score: number, skipped: null | RegExpMatchArray, from: number) {
  return skipped && from > 0
    ? score * PENALTY_SKIPPED ** skipped.length
    : score;
}

function jumpScore(text: string, jump: Jump): number {
  const { from, index, score } = jump;
  if (index === from) {
    return score * SCORE_CONTINUE_MATCH;
  }
  const before = text.charAt(index - 1);
  const skipped = text.slice(from, index - 1);
  if (GAP.test(before)) {
    return skip(score * SCORE_NON_SPACE_WORD_JUMP, skipped.match(GAPS), from);
  }
  if (SPACE.test(before)) {
    return skip(score * SCORE_SPACE_WORD_JUMP, skipped.match(SPACES), from);
  }
  const jumped = score * SCORE_CHARACTER_JUMP;
  return from > 0 ? jumped * PENALTY_SKIPPED ** (index - from) : jumped;
}

function positions(text: string, character: string, from: number): number[] {
  const index = text.indexOf(character, from);
  return index < 0 ? [] : [index, ...positions(text, character, index + 1)];
}

function matchScore(match: Match, candidate: Candidate): number {
  const { cursor, high, index } = candidate;
  const { abbreviationIndex, stringIndex } = cursor;
  const score = bestScore(match, {
    abbreviationIndex: abbreviationIndex + 1,
    stringIndex: index + 1,
  });
  if (score <= high) {
    return score;
  }
  const jumped = jumpScore(match.text, { from: stringIndex, index, score });
  return match.text.charAt(index) ===
    match.abbreviation.charAt(abbreviationIndex)
    ? jumped
    : jumped * PENALTY_CASE_MISMATCH;
}

function transpose(match: Match, candidate: Candidate, score: number): number {
  const { cursor, index } = candidate;
  const { abbreviationIndex } = cursor;
  const character = match.lowerAbbreviation.charAt(abbreviationIndex);
  const next = match.lowerAbbreviation.charAt(abbreviationIndex + 1);
  const previous = match.lowerText.charAt(index - 1);
  const swapped =
    (score < SCORE_TRANSPOSITION && previous === next) ||
    (next === character && previous !== character);
  if (!swapped) {
    return score;
  }
  const transposed =
    bestScore(match, {
      abbreviationIndex: abbreviationIndex + 2,
      stringIndex: index + 1,
    }) * SCORE_TRANSPOSITION;
  return transposed > score ? transposed : score;
}

function bestScore(match: Match, cursor: Cursor): number {
  const { abbreviation, lowerAbbreviation, lowerText, memo, text } = match;
  const { abbreviationIndex, stringIndex } = cursor;
  if (abbreviationIndex === abbreviation.length) {
    return stringIndex === text.length
      ? SCORE_CONTINUE_MATCH
      : PENALTY_NOT_COMPLETE;
  }
  const key = `${stringIndex},${abbreviationIndex}`;
  const known = memo.get(key);
  if (known !== undefined) {
    return known;
  }
  const character = lowerAbbreviation.charAt(abbreviationIndex);
  const best = positions(lowerText, character, stringIndex).reduce(
    (high, index) => {
      const candidate = { cursor, high, index };
      return Math.max(
        high,
        transpose(match, candidate, matchScore(match, candidate)),
      );
    },
    0,
  );
  memo.set(key, best);
  return best;
}

/**
 * How well `abbreviation` matches `string` and its `aliases`, from 0 (no
 * match) to 1 (the same text). Letters must appear in order, case does not
 * matter, and word starts, runs of letters and a short string score higher.
 * This is the cmdk default, so a `Command` ranks as it did on cmdk.
 */
export function commandScore(
  string: string,
  abbreviation: string,
  aliases: readonly string[] = [],
): number {
  const text = aliases.length > 0 ? `${string} ${aliases.join(" ")}` : string;
  return bestScore(
    {
      abbreviation,
      lowerAbbreviation: foldSpaces(abbreviation),
      lowerText: foldSpaces(text),
      memo: new Map(),
      text,
    },
    { abbreviationIndex: 0, stringIndex: 0 },
  );
}
