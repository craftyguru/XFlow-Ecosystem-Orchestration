import assert from "node:assert/strict";
import {
  assertNoLeaks,
  containsAllowedPublicPlanSlug,
  redactSecretLikeValues,
  scanTextForLeaks,
} from "./ecosystem-proof-scanner.mjs";

assert.equal(scanTextForLeaks('{"stripeCustomerId":"cus_123456"}').length >= 1, true);
assert.equal(scanTextForLeaks('{"token":"abc"}').length >= 1, true);
assert.equal(containsAllowedPublicPlanSlug("wordgeni_pro"), true);
assert.equal(assertNoLeaks("plan slug wordgeni_pro is public"), true);

const redacted = redactSecretLikeValues({
  nested: {
    token: "server-token",
    value: "cus_123456",
  },
});
assert.equal(redacted.nested.token, "[redacted]");
assert.equal(redacted.nested.value, "cus_[redacted]");

console.log("ecosystem proof scanner tests ok");
