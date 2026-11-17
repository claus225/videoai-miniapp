import { handleMcpRequest } from "./mcp.js"

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" },
})

function hasValidMcpToken(request, env) {
  const expected = env.KREA_MCP_TOKEN
  const supplied = request.headers.get("authorization") || ""
  return Boolean(expected) && supplied === `Bearer ${expected}`
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
      if (!env.KREA_MCP_TOKEN) {
        return json({ error: "MCP gateway is not configured yet." }, 503)
      }
      if (!hasValidMcpToken(request, env)) {
        return json({ error: "Unauthorized" }, 401)
      }
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405)
      }
      return handleMcpRequest(request)
    }

    return json({ error: "Not found" }, 404)
  },

  // The real scheduler will be added only after authenticated accounts,
  // encrypted credentials, and platform-specific publishing are implemented.
  async scheduled() {
    console.log("KREA scheduler is not enabled yet.")
  },
}
