import assert from "node:assert/strict";
import test from "node:test";

import { matchBands } from "./bandMatcher.js";

const bands = [
  { slug: "a-perfect-circle", name: "A Perfect Circle" },
  { slug: "aborym", name: "Aborym" },
  { slug: "ac-dc", name: "AC/DC" },
  { slug: "mortem", name: "Mortem" },
];

test("matches a band name appearing in a post title", () => {
  const matches = matchBands("ABORYM: annunciato il nuovo album", bands);
  assert.deepEqual(matches.map((b) => b.slug), ["aborym"]);
});

test("matches case-insensitively", () => {
  const matches = matchBands("aborym pubblica un nuovo video", bands);
  assert.deepEqual(matches.map((b) => b.slug), ["aborym"]);
});

test("does not match a substring of another word", () => {
  const matches = matchBands("Mortemoria annuncia un nuovo singolo", bands);
  assert.deepEqual(matches, []);
});

test("can match multiple bands in the same title", () => {
  const matches = matchBands("MORTEM e ABORYM insieme in tour", bands);
  assert.deepEqual(
    matches.map((b) => b.slug).sort(),
    ["aborym", "mortem"],
  );
});

test("returns no matches when nothing matches", () => {
  const matches = matchBands("Notizie generali dal mondo metal", bands);
  assert.deepEqual(matches, []);
});
