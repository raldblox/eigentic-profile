import "server-only"

import { ConvexHttpClient } from "convex/browser"
import { anyApi } from "convex/server"

export function getConvexClient() {
  return getConvexClientWithDebug(false)
}

export function getConvexClientWithDebug(debugHttp: boolean) {
  const url = process.env.CONVEX_URL
  if (!url) {
    throw new Error("Missing CONVEX_URL in environment")
  }
  const client = new ConvexHttpClient(url, {
    fetch: async (input, init) => {
      const response = await fetch(input, init)
      if (debugHttp) {
        const cloned = response.clone()
        const body = await cloned.text()
        const requestUrl =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url
        console.error("Convex HTTP error", {
          url: requestUrl,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          body,
        })
      }
      return response
    },
  })
  return client
}

export { anyApi }
