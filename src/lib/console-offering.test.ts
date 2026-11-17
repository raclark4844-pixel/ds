import { test } from "node:test";
import assert from "node:assert/strict";
import { customerPdfText } from "./console-offering.ts";

test("customer PDFs keep the Tech address and drop the other company identity", () => {
  // Intentional negative-test fixtures for Demore Exterior Solutions (already-public business contact info)
  const domain = "demoreexteriorsolutions.com";
  const name = "Demore Exterior Solutions";
  const shortName = "Demore Exterior";
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