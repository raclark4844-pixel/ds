import assert from "node:assert/strict";
import { test } from "node:test";
import { publicContacts, reviewContactSchema } from "./contact.ts";
import { websiteReviewCopyText } from "../report-mail-copy.ts";
import type { WebsiteReviewReport } from "./types.ts";

test("requires name, valid email, phone and company", () => {
  assert.equal(reviewContactSchema.safeParse({}).success, false);
  assert.equal(reviewContactSchema.safeParse({ name: "Ryan", email: "invalid" }).success, false);
  assert.equal(
    reviewContactSchema.safeParse({
      name: "Ryan",
      email: "ryan@example.com",
      phone: "4405550123",
      company: "Demore",
    }).success,
    true,
  );
});
test("rejects missing company or phone", () => {
  const contact = {
    name: "Ryan",
    email: "ryan@example.com",
    phone: "4405550123",
    company: "Demore",
  };
  assert.equal(reviewContactSchema.safeParse({ ...contact, phone: "" }).success, false);
  assert.equal(reviewContactSchema.safeParse({ ...contact, company: "" }).success, false);
  assert.equal(reviewContactSchema.safeParse({ ...contact, phone: "abcdefghi" }).success, false);
});
test("extracts sourced public contact details while ignoring scripts", () => {
  assert.deepEqual(
    publicContacts([
      {
        url: "https://example.com/contact",
        html: '<script>hidden@example.com</script><a href="mailto:hello@example.com">hello@example.com</a><a href="tel:+14405550123">Call</a>',
      },
    ]),
    [
      {
        source: "https://example.com/contact",
        emails: ["hello@example.com"],
        phones: ["+14405550123"],
      },
    ],
  );
});
test("internal report includes supplied and sourced contacts", () => {
  const report = {
    recordId: "DTS-12345678",
    current: { url: "https://example.com", title: "Example", checks: [] },
    benchmark: { unavailable: true },
    industry: { name: "Restaurant" },
    categories: [],
    recommendations: [],
    contact: {
      name: "Test Visitor",
      email: "visitor@example.com",
      phone: "1234567890",
      company: "Example",
    },
    publicContacts: [
      {
        source: "https://example.com/contact",
        emails: ["hello@example.com"],
        phones: ["1234567890"],
      },
    ],
  } as unknown as WebsiteReviewReport;
  const text = websiteReviewCopyText(report);
  assert.match(text, /Test Visitor/);
  assert.match(text, /visitor@example.com/);
  assert.match(text, /hello@example.com/);
  assert.match(text, /https:\/\/example.com\/contact/);
  report.ownerReview = true;
  delete report.contact;
  assert.match(websiteReviewCopyText(report), /Signed-in administrator/);
});
