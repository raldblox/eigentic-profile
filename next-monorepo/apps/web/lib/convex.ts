import "server-only"

import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../convex/_generated/api"

export function getConvexClient() {
  const url = process.env.CONVEX_URL
  if (!url) {
    throw new Error("Missing CONVEX_URL in environment")
  }
  return new ConvexHttpClient(url)
}

export { api }
