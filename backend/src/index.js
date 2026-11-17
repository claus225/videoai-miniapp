const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" },
})

export default {
  async fetch(request) {
    const url = new URL(request.url)

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        service: "krea-studio-api",
        status: "ok",
        stage: "foundation",
        socialConnectionsEnabled: false,
        publishingEnabled: false,
      })
    }

    return json({ error: "Not found" }, 404)
  },

  // The real scheduler will be added only after authenticated accounts,
  // encrypted credentials, and platform-specific publishing are implemented.
  async scheduled() {
    console.log("KREA scheduler is not enabled yet.")
  },
}
