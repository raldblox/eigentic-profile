import "server-only"

import { ConvexHttpClient } from "convex/browser"
import { version } from "convex"
import { convexToJson, jsonToConvex, type JSONValue } from "convex/values"
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

type ConvexMutationResponse =
  | { status: "success"; value: JSONValue }
  | { status: "error"; errorMessage: string; errorData?: JSONValue }

export async function runConvexMutation<T>(
  path: string,
  args: Record<string, unknown>,
  opts?: { debugHttp?: boolean },
): Promise<T> {
  const url = process.env.CONVEX_URL
  if (!url) {
    throw new Error("Missing CONVEX_URL in environment")
  }

  const body = JSON.stringify({
    path,
    format: "convex_encoded_json",
    args: [convexToJson(args as never)],
  })

  const response = await fetch(`${url}/api/mutation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`,
    },
    body,
  })

  if (opts?.debugHttp) {
    const responseText = await response.clone().text()
    console.error("Raw Convex mutation response", {
      url: `${url}/api/mutation`,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      body: responseText,
    })
  }

  if (!response.ok) {
    throw new Error(await response.text())
  }

  const payload = (await response.json()) as ConvexMutationResponse
  if (payload.status === "error") {
    throw new Error(payload.errorMessage)
  }
  return jsonToConvex(payload.value) as T
}

export { anyApi }
