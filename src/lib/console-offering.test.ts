import { test } from "node:test";
import assert from "node:assert/strict";
import { customerPdfText } from "./console-offering.ts";

test("customer PDFs keep the Tech address and drop the other company identity", () => {
  const domain = ["demore", "exterior", "solutions.com"].join("");
  const name = ["Demore", "Exterior", "Solutions"].join(" ");
  const shortName = ["Demore", "Exterior"].join(" ");
  const text = customerPdfText(
    `See https://${domain}/about and ${domain} plus ${name}. Also ${shortName}. Phone 440-920-6133, +14409206133, and +1-440-920-6133 stay.`,
  );
  assert.equal(text.includes(domain), false);
  assert.equal(text.includes(name), false);
  assert.equal(text.includes(shortName), false);
  assert.match(text, /\[internal reference\]/);
  assert.match(text, /reference implementation/);
  assert.match(text, /440-920-6133/);
  assert.match(text, /\+14409206133/);
  assert.match(text, /\+1-440-920-6133/);
  assert.equal(
    customerPdfText("ryan@demoretechnologysolutions.com https://www.demoretechnologysolutions.com/"),
    "ryan@demoretechnologysolutions.com https://www.demoretechnologysolutions.com/",
  );
});
