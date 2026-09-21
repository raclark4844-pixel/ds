import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRevisionIntent, revisionIntentPrompt } from "./revision-intent.ts";
test("accepts only structured revision decisions", () => {
  assert.equal(parseRevisionIntent('{"action":"revise"}'), "revise");
  assert.equal(parseRevisionIntent('```json\n{"action":"ask"}\n```'), "ask");
  assert.equal(parseRevisionIntent("Update this PDF"), "none");
  assert.equal(parseRevisionIntent('{"action":"delete"}'), "none");
});
test("classification distinguishes committed changes, tentative ideas and no-change requests", () => {
  const prompt = revisionIntentPrompt("Maybe we could offer catering?");
  assert.match(prompt, /tentative/);
  assert.match(prompt, /explicit instructions not to change/);
  assert.match(prompt, /visitor data/);
});
