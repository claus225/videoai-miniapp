import { handleMcpRequest } from "./mcp.js"

const securityHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: securityHeaders,
})

function addSecurityHeaders(response) {
  const headers = new Headers(response.headers)
  for (const [name, value] of Object.entries(securityHeaders)) {
    if (name !== "content-type") headers.set(name, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

async function hasValidMcpToken(request, env) {
  const expected = env.KREA_MCP_TOKEN
  const authorization = request.headers.get("authorization") || ""
  const prefix = "Bearer "
  if (typeof expected !== "string" || expected.length === 0 || !authorization.startsWith(prefix)) {
    return false
  }

  const supplied = authorization.slice(prefix.length)
  const encoder = new TextEncoder()
  const [expectedHash, suppliedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
    crypto.subtle.digest("SHA-256", encoder.encode(supplied)),
  ])

  const expectedBytes = new Uint8Array(expectedHash)
  const suppliedBytes = new Uint8Array(suppliedHash)
  let difference = 0
  for (let index = 0; index < expectedBytes.length; index += 1) {
    difference |= expectedBytes[index] ^ suppliedBytes[index]
  }
  return difference === 0
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        service: "krea-studio-api",
        status: "ok",
        stage: "integration-foundation",
        mcpConfigured: Boolean(env.KREA_MCP_TOKEN),
        socialConnectionsEnabled: false,
        publishingEnabled: false,
        aiAssistantsEnabled: false,
      })
    }

    if (url.pathname === "/mcp") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405)
      }
      if (!env.KREA_MCP_TOKEN) {
        return json({ error: "MCP gateway is not configured yet." }, 503)
      }
      if (!await hasValidMcpToken(request, env)) {
        return json({ error: "Unauthorized" }, 401)
      }
      const contentType = request.headers.get("content-type") || ""
      if (!contentType.toLowerCase().startsWith("application/json")) {
        return json({ error: "Unsupported media type" }, 415)
      }
      return addSecurityHeaders(await handleMcpRequest(request))
    }

    return json({ error: "Not found" }, 404)
  },

  // The real scheduler will be added only after authenticated accounts,
  // encrypted credentials, and platform-specific publishing are implemented.
  async scheduled() {
    console.log("KREA scheduler is not enabled yet.")
  },
}
