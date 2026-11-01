import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test, { after, before } from "node:test";
import type { AiClient, AiGenerateOptions, AiStreamOptions } from "../../server/ai/geminiClient.ts";
import { createApp } from "../../server/app.ts";

class MockAiClient implements AiClient {
  public shouldFail = false;
  public returnInvalidJson = false;

  public isConfigured(): boolean {
    return true;
  }

  public async *generateStream(options: AiStreamOptions): AsyncIterable<string> {
    if (this.shouldFail) {
      throw new Error("AI provider failed");
    }
    if (options.signal?.aborted) return;
    yield "Streamed chunk 1: ";
    yield "Creative concept details.";
  }

  public async generateText(_options: AiGenerateOptions): Promise<string> {
    if (this.shouldFail) {
      throw new Error("AI provider error");
    }
    if (this.returnInvalidJson) {
      return "Not json at all";
    }
    return JSON.stringify({
      questionsToAsk: ["Do you bring backup gear?", "Are all fees itemized?"],
      redFlags: ["Refusal to share insurance", "High cash deposit requirement"],
    });
  }
}

let server: Server;
let baseUrl: string;
const mockClient = new MockAiClient();

before(async () => {
  const app = createApp({ aiClient: mockClient });
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const addr = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test("GET /api/health returns 200 ok and security headers", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  const data = await res.json();
  assert.equal(data.status, "ok");
});

test("POST /api/ideas-stream rejects invalid body with 400 and consistent error shape", async () => {
  const res = await fetch(`${baseUrl}/api/ideas-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "" }), // missing required intake fields
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
  assert.equal(data.code, "INVALID_INTAKE");
});

test("POST /api/ideas-stream streams AI chunks with SSE", async () => {
  mockClient.shouldFail = false;
  const res = await fetch(`${baseUrl}/api/ideas-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "wedding",
      name: "Sam & Riley",
      date: "2027-06-15",
      guestCount: 100,
      totalBudgetMinor: 2000000,
      currency: "USD",
      city: "Austin",
      priorities: ["Venue"],
    }),
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/event-stream");
  const text = await res.text();
  assert.ok(text.includes("event: metadata"));
  assert.ok(text.includes("event: chunk"));
  assert.ok(text.includes("event: done"));
});

test("POST /api/ideas-stream falls back to template ideas when AI fails", async () => {
  mockClient.shouldFail = true;
  const res = await fetch(`${baseUrl}/api/ideas-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "birthday",
      name: "Jamie 30th",
      date: "2027-05-10",
      guestCount: 40,
      totalBudgetMinor: 500000,
      currency: "USD",
      city: "Chicago",
      priorities: ["Food & Drinks"],
    }),
  });
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes("Template-based (AI unavailable)"));
  assert.ok(text.includes("event: done"));
  mockClient.shouldFail = false;
});

test("POST /api/vendor-guidance returns valid questions and red flags, falls back on malformed output", async () => {
  mockClient.shouldFail = false;
  mockClient.returnInvalidJson = false;

  const validRes = await fetch(`${baseUrl}/api/vendor-guidance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: "Venue", eventType: "wedding" }),
  });
  assert.equal(validRes.status, 200);
  const validData = await validRes.json();
  assert.equal(validData.source, "ai");
  assert.ok(validData.questionsToAsk.length >= 2);

  // Test malformed JSON fallback
  mockClient.returnInvalidJson = true;
  const fallbackRes = await fetch(`${baseUrl}/api/vendor-guidance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: "Venue", eventType: "wedding" }),
  });
  assert.equal(fallbackRes.status, 200);
  const fallbackData = await fallbackRes.json();
  assert.equal(fallbackData.source, "fallback");
  assert.ok(fallbackData.questionsToAsk.length >= 2);
  mockClient.returnInvalidJson = false;
});

test("POST /api/assistant-stream rejects invalid plan and invalid message with 400", async () => {
  const res1 = await fetch(`${baseUrl}/api/assistant-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "", plan: {} }),
  });
  assert.equal(res1.status, 400);

  const res2 = await fetch(`${baseUrl}/api/assistant-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello", plan: null }),
  });
  assert.equal(res2.status, 400);
});

test("Oversized body > 20kb is rejected", async () => {
  const hugeString = "x".repeat(25000);
  const res = await fetch(`${baseUrl}/api/ideas-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ huge: hugeString }),
  });
  assert.ok(res.status >= 400);
});
