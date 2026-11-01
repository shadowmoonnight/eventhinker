import assert from "node:assert/strict";
import test from "node:test";
import { clampNumber, sanitizeStr } from "../../shared/sanitize.ts";

test("sanitizeStr strips ASCII control characters and trims", () => {
  assert.equal(sanitizeStr("Hello\u0000World\u001F!"), "Hello World !");
  assert.equal(sanitizeStr("  leading and trailing  "), "leading and trailing");
  assert.equal(sanitizeStr(null), "");
  assert.equal(sanitizeStr(undefined), "");
  assert.equal(sanitizeStr("a".repeat(600), 10), "aaaaaaaaaa");
});

test("clampNumber handles valid, extreme, and invalid numbers", () => {
  assert.equal(clampNumber(50, 0, 100), 50);
  assert.equal(clampNumber(-10, 0, 100), 0);
  assert.equal(clampNumber(150, 0, 100), 100);
  assert.equal(clampNumber("42", 0, 100), 42);
  assert.equal(clampNumber("not-a-number", 10, 100, 25), 25);
  assert.equal(clampNumber(NaN, 5, 20, 5), 5);
  assert.equal(clampNumber(Infinity, 0, 100, 10), 10);
});
