import test from "node:test"
import assert from "node:assert/strict"
import worker from "../src/index.js"

const baseUrl = "https://krea.test"

test("GET /health reports integration state without exposing secrets", async () => {
  const response = await worker.fetch(new Request(baseUrl + "/health"), {
    KREA_MCP_TOKEN: "never-return-this-value",
  })
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.service, "krea-studio-api")
  assert.equal(body.status, "ok")
  assert.equal(body.mcpConfigured, true)
  assert.equal(body.socialConnectionsEnabled, false)
  assert.equal(body.publishingEnabled, false)
  assert.equal(JSON.stringify(body).includes("never-return-this-value"), false)
})

test("GET /health reports MCP as unconfigured when no token exists", async () => {
  const response = await worker.fetch(new Request(baseUrl + "/health"), {})
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.mcpConfigured, false)
})

test("POST /mcp is unavailable until a token is configured", async () => {
  const response = await worker.fetch(new Request(baseUrl + "/mcp", { method: "POST" }), {})
  assert.equal(response.status, 503)
})

test("POST /mcp rejects a missing or invalid bearer token", async () => {
  const env = { KREA_MCP_TOKEN: "test-secret" }
  const missing = await worker.fetch(new Request(baseUrl + "/mcp", { method: "POST" }), env)
  const invalid = await worker.fetch(new Request(baseUrl + "/mcp", {
    method: "POST",
    headers: { authorization: "Bearer wrong-secret" },
  }), env)
  assert.equal(missing.status, 401)
  assert.equal(invalid.status, 401)
})

test("GET /mcp is rejected even with a valid bearer token", async () => {
  const response = await worker.fetch(new Request(baseUrl + "/mcp", {
    headers: { authorization: "Bearer test-secret" },
  }), { KREA_MCP_TOKEN: "test-secret" })
  assert.equal(response.status, 405)
})

test("unknown routes return 404", async () => {
  const response = await worker.fetch(new Request(baseUrl + "/unknown"), {})
  assert.equal(response.status, 404)
})

test("API responses include no-store and basic security headers", async () => {
  const response = await worker.fetch(new Request(baseUrl + "/health"), {})
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.equal(response.headers.get("x-content-type-options"), "nosniff")
  assert.equal(response.headers.get("x-frame-options"), "DENY")
  assert.equal(response.headers.get("referrer-policy"), "no-referrer")
})

test("POST /mcp rejects non-JSON content types after authentication", async () => {
  const response = await worker.fetch(new Request(baseUrl + "/mcp", {
    method: "POST",
    headers: {
      authorization: "Bearer test-secret",
      "content-type": "text/plain",
    },
    body: "not-json",
  }), { KREA_MCP_TOKEN: "test-secret" })
  assert.equal(response.status, 415)
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.equal(response.headers.get("x-content-type-options"), "nosniff")
})


test("POST /mcp rejects browser origins not on the configured allowlist", async () => {
  const response = await worker.fetch(new Request(baseUrl + "/mcp", {
    method: "POST",
    headers: {
      authorization: "Bearer test-secret",
      origin: "https://untrusted.example",
      "content-type": "application/json",
    },
    body: "{}",
  }), {
    KREA_MCP_TOKEN: "test-secret",
    KREA_MCP_ALLOWED_ORIGINS: "https://app.krea.example",
  })
  assert.equal(response.status, 403)
  assert.equal(response.headers.get("cache-control"), "no-store")
})

test("POST /mcp rejects JSON-like but invalid media types", async () => {
  const response = await worker.fetch(new Request(baseUrl + "/mcp", {
    method: "POST",
    headers: {
      authorization: "Bearer test-secret",
      "content-type": "application/jsonp",
    },
    body: "{}",
  }), { KREA_MCP_TOKEN: "test-secret" })
  assert.equal(response.status, 415)
})
