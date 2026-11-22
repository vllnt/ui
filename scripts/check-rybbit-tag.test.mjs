import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { main, rybbitProblems, rybbitTags } from "./check-rybbit-tag.mjs";

const ID = "test-site-id";
// The exact shapes the registry (React) and Storybook (string) render.
const registryTag = `<script data-site-id="${ID}" defer="" src="https://edge.vllnt.com/api/script.js"></script>`;
const storybookTag = `<script defer data-site-id="${ID}" src="https://edge.vllnt.com/api/script.js"></script>`;
const page = (body) => `<!DOCTYPE html><html><head><script src="/_next/static/chunks/main.js" async=""></script></head><body>${body}</body></html>`;

test("one registry or Storybook tag with the right id passes", () => {
  assert.deepEqual(rybbitProblems(page(registryTag), ID), []);
  assert.deepEqual(rybbitProblems(page(storybookTag), ID), []);
});

test("Next flight data holding the element as JSON is not a tag", () => {
  const flight = `<script>self.__next_f.push([1,"[\\"$\\",\\"script\\",null,{\\"data-site-id\\":\\"${ID}\\",\\"defer\\":true,\\"src\\":\\"https://edge.vllnt.com/api/script.js\\"}]"])</script>`;
  assert.equal(rybbitTags(page(flight)).length, 0);
  assert.deepEqual(rybbitProblems(page(registryTag + flight), ID), []);
});

test("no tag, two tags, a wrong id, a wrong host or no defer fail", () => {
  assert.match(rybbitProblems(page(""), ID)[0], /found 0/);
  assert.match(rybbitProblems(page(registryTag + storybookTag), ID)[0], /found 2/);
  assert.match(rybbitProblems(page(registryTag), "other-id")[0], /data-site-id is test-site-id, expected other-id/);
  assert.match(rybbitProblems(page(registryTag.replace("edge.vllnt.com", "analytics.example.test")), ID)[0], /src is https:\/\/analytics\.example\.test/);
  assert.match(rybbitProblems(page(storybookTag.replace("defer ", "")), ID)[0], /no defer/);
  assert.match(rybbitProblems(page(registryTag.replace(` data-site-id="${ID}"`, "")), ID)[0], /data-site-id is missing/);
});

test("--none passes on a page without the tag and fails on any Rybbit tag", () => {
  assert.deepEqual(rybbitProblems(page(""), undefined), []);
  assert.equal(rybbitProblems(page(storybookTag.replace("edge.vllnt.com", "analytics.example.test")), undefined).length, 1);
});

test("the CLI reads a file and exits 0, 1 or 2", async () => {
  const dir = mkdtempSync(join(tmpdir(), "rybbit-"));
  const file = join(dir, "index.html");
  writeFileSync(file, page(storybookTag));
  const errors = [];
  const { error, log } = console;
  console.error = (line) => errors.push(line);
  console.log = () => {};
  try {
    assert.equal(await main([file, "--site-id", ID]), 0);
    assert.equal(await main([file, "--none"]), 1);
    assert.equal(await main([file, "--site-id", "other-id"]), 1);
    assert.equal(await main([file]), 2);
    assert.equal(await main([file, "--none", "extra"]), 2);
  } finally {
    Object.assign(console, { error, log });
  }
  assert.ok(errors.some((line) => line.includes("unexpected Rybbit tag")));
});
