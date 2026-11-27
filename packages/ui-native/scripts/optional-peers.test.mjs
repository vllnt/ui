import assert from "node:assert/strict";
import test from "node:test";

import {
  brokenOptionalRequires,
  OPTIONAL_PEERS,
  restoreOptionalRequires,
} from "./optional-peers.mjs";

const shimmed = [
  'var __require = (x) => { throw Error("Dynamic require of " + x); };',
  "try {",
  '  glass = __require("expo-glass-effect");',
  '  blur = __require("expo-blur");',
  "} catch {}",
].join("\n");

test("lists both glass peers", () => {
  assert.deepEqual(OPTIONAL_PEERS, ["expo-blur", "expo-glass-effect"]);
});

test("restores the plain require that esbuild rewrote", () => {
  const restored = restoreOptionalRequires(shimmed);
  assert.match(restored, /glass = require\("expo-glass-effect"\)/);
  assert.match(restored, /blur = require\("expo-blur"\)/);
  assert.deepEqual(brokenOptionalRequires(restored), []);
});

test("leaves other __require calls alone", () => {
  const source = '__require("react-native");';
  assert.equal(restoreOptionalRequires(source), source);
});

test("reports a peer that still loads through the shim", () => {
  assert.deepEqual(brokenOptionalRequires(shimmed), [
    "expo-blur",
    "expo-glass-effect",
  ]);
});

test("reports a peer that the file does not load at all", () => {
  const source = 'try { blur = require("expo-blur"); } catch {}';
  assert.deepEqual(brokenOptionalRequires(source), ["expo-glass-effect"]);
});

test("does not count a static import as a require", () => {
  const source = 'import "expo-blur"; import "expo-glass-effect";';
  assert.deepEqual(brokenOptionalRequires(source), [
    "expo-blur",
    "expo-glass-effect",
  ]);
});
