import assert from "node:assert/strict";
import test from "node:test";
import type { VendorItem } from "../../shared/types.ts";
import { summarizeVendors, updateVendorItem } from "../../shared/vendors.ts";

const sampleVendor: VendorItem = {
  id: "v-1",
  name: "Catering Co",
  category: "Catering & Bar",
  status: "to-contact",
  quoteMinor: 0,
  notes: "Initial inquiry",
  questionsToAsk: ["Do you provide tasting?"],
  redFlags: ["No insurance"],
};

test("updateVendorItem updates status, quote, and notes correctly", () => {
  const res = updateVendorItem(sampleVendor, {
    status: "quoted",
    quoteMinor: 150000,
    notes: "Tasting scheduled",
  });

  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.status, "quoted");
    assert.equal(res.value.quoteMinor, 150000);
    assert.equal(res.value.notes, "Tasting scheduled");
  }
});

test("updateVendorItem rejects invalid status or negative quote", () => {
  // Invalid status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invalidStatusRes = updateVendorItem(sampleVendor, { status: "unknown" as any });
  assert.equal(invalidStatusRes.ok, false);

  // Negative quote
  const negativeQuoteRes = updateVendorItem(sampleVendor, { quoteMinor: -500 });
  assert.equal(negativeQuoteRes.ok, false);
});

test("summarizeVendors aggregates booked and quoted totals accurately", () => {
  const vendors: VendorItem[] = [
    { ...sampleVendor, id: "1", status: "booked", quoteMinor: 200000 },
    { ...sampleVendor, id: "2", status: "quoted", quoteMinor: 100000 },
    { ...sampleVendor, id: "3", status: "to-contact", quoteMinor: 0 },
    { ...sampleVendor, id: "4", status: "booked", quoteMinor: 50000 },
  ];

  const summary = summarizeVendors(vendors);
  assert.equal(summary.bookedCount, 2);
  assert.equal(summary.totalBookedMinor, 250000);
  assert.equal(summary.totalQuotedMinor, 100000);
});
