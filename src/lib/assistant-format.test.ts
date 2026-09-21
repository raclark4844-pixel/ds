import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  chatBody,
  conversationInput,
  parseAssistantOutput,
  publishedSiteFallback,
  responsesBody,
  savedReviewFallback,
  shouldUseWebSearch,
  systemPrompt,
} from "./assistant-format.ts";

describe("Ask Demore formatting", () => {
  it("turns on web search only for live-market questions", () => {
    assert.equal(shouldUseWebSearch("What should I fix first on this review?"), false);
    assert.equal(shouldUseWebSearch("Who are the current competitors near Mentor?"), true);
  });

  it("does not duplicate the current user message in history", () => {
    const rows = conversationInput("Fix measurement first", [
      { role: "assistant", content: "I have website review **DTS-41F6B18F**." },
      { role: "user", content: "Fix measurement first" },
    ]);
    assert.equal(rows.filter((row) => row.role === "user").length, 1);
    assert.equal(rows.at(-1)?.content, "Fix measurement first");
  });

  it("omits empty tools so the request is valid without search", () => {
    const body = responsesBody({
      model: "grok-4.6",
      instructions: "Be brief.",
      messages: [{ role: "user", content: "Hello" }],
      search: false,
    });
    assert.equal("tools" in body, false);
    assert.equal("include" in body, false);
    assert.equal(body.store, false);
    assert.deepEqual(body.reasoning, { effort: "low" });
    assert.equal(body.max_output_tokens, 2400);
  });

  it("parses both Responses and Chat Completions payloads", () => {
    const responses = parseAssistantOutput({ output_text: "From responses." });
    assert.equal(responses.text, "From responses.");
    const chat = parseAssistantOutput({ choices: [{ message: { content: "From chat." } }] });
    assert.equal(chat.text, "From chat.");
  });

  it("builds a saved-review fallback without inventing rankings or vendor names", () => {
    const text = savedReviewFallback("Demore website review DTS-41F6B18F\nNot detected:\n- Search Console verification: Verify the site.");
    assert.match(text, /DTS-41F6B18F/);
    assert.match(text, /Rankings, AI citations, and conversion lifts are not guaranteed/);
    assert.doesNotMatch(text, /ChatGPT|Claude|Gemini|OpenAI/i);
    assert.doesNotMatch(text, /\$\d/);
    assert.equal(savedReviewFallback(""), "");
  });

  it("answers from published site copy when no review is attached", () => {
    const text = publishedSiteFallback();
    assert.match(text, /Mentor, Lake County, Ohio/);
    assert.match(text, /ryan@demoretechnologysolutions.com/);
    assert.match(text, /Rankings, AI citations, and conversion lifts are not guaranteed/);
    assert.doesNotMatch(text, /ChatGPT|Claude|Gemini|OpenAI/i);
    assert.doesNotMatch(text, /guaranteed ranking/i);
    assert.doesNotMatch(text, /Live web information is temporarily unavailable\. Continue from the saved comparison report or labeled benchmarks/);
  });

  it("keeps vendor names out of the system prompt and keeps lead-engine pages", () => {
    const prompt = systemPrompt("", "DTS-41F6B18F", "Public HTML scan only.");
    assert.doesNotMatch(prompt, /ChatGPT|Claude|Gemini|OpenAI/i);
    assert.match(prompt, /DTS-41F6B18F/);
    assert.match(prompt, /lead-generation/);
    assert.match(prompt, /industries\/restaurants/);
    assert.match(prompt, /industries\/pubs/);
    assert.match(prompt, /industries\/pizza-shops/);
  });

  it("keeps chat completions on the system-message path", () => {
    const body = chatBody({
      model: "grok-4.5",
      instructions: "Be brief.",
      messages: [{ role: "user", content: "Hello" }],
    });
    assert.equal(body.messages[0]?.role, "system");
    assert.equal(body.max_tokens, 2400);
    assert.equal(body.reasoning_effort, "low");
  });
});
