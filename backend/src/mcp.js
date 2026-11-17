import { McpServer, WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server"

const textResult = value => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
})

function createKreaMcpServer() {
  const server = new McpServer({
    name: "krea-studio",
    version: "0.1.0",
  })

  // First release is deliberately read-only. Social account access and
  // write actions must wait for user authentication, per-user authorization,
  // and explicit confirmation flows.
  server.registerTool(
    "krea_status",
    {
      description: "Read the current KREA STUDIO integration status. This tool does not access or change social accounts.",
    },
    async () => textResult({
      product: "KREA STUDIO Social Manager",
      stage: "integration-foundation",
      socialConnections: "not-configured",
      scheduledPublishing: "not-enabled",
      aiProviders: {
        claude: "not-configured",
        openai: "not-configured",
      },
      availableActions: ["read_project_status"],
      safety: "read-only; no social account actions are enabled",
    }),
  )

  return server
}

export async function handleMcpRequest(request) {
  const server = createKreaMcpServer()
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })

  await server.connect(transport)
  return transport.handleRequest(request)
}
