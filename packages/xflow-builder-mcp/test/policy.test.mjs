import test from "node:test";
import assert from "node:assert/strict";
import { assertBuilderSafeRequest, joinApiUrl } from "../src/policy.mjs";

test("allows registered WordGeni and Crevux routes", () => {
  assert.deepEqual(assertBuilderSafeRequest("wordgeni", "POST", "/api/genie/chat"), {
    method: "POST",
    path: "/api/genie/chat",
  });
  assert.deepEqual(assertBuilderSafeRequest("crevux", "POST", "/api/openai/generate-image"), {
    method: "POST",
    path: "/api/openai/generate-image",
  });
  assert.deepEqual(assertBuilderSafeRequest("crevux", "GET", "/api/assets/00000000-0000-4000-8000-000000000042"), {
    method: "GET",
    path: "/api/assets/00000000-0000-4000-8000-000000000042",
  });
  assert.deepEqual(assertBuilderSafeRequest("crevux", "GET", "/api/video/jobs/list?limit=20&offset=0"), {
    method: "GET",
    path: "/api/video/jobs/list?limit=20&offset=0",
  });
});

test("blocks arbitrary origins, traversal, and unregistered routes", () => {
  assert.throws(() => assertBuilderSafeRequest("wordgeni", "GET", "https://example.com/api/genie/chat"));
  assert.throws(() => assertBuilderSafeRequest("crevux", "GET", "/api/../admin/users"));
  assert.throws(() => assertBuilderSafeRequest("crevux", "DELETE", "/api/assets/1"));
  assert.throws(() => assertBuilderSafeRequest("crevux", "PATCH", "/api/assets/00000000-0000-4000-8000-000000000042"));
});

test("joins API origins without duplicating the api segment", () => {
  assert.equal(joinApiUrl("https://api.wordgeni.com", "/api/genie/chat"), "https://api.wordgeni.com/api/genie/chat");
  assert.equal(joinApiUrl("https://crevux.com/api", "/api/healthz"), "https://crevux.com/api/healthz");
});
