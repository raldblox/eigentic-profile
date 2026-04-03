import { NextResponse } from "next/server"
import { withX402 } from "@x402/next"

import { anyApi, getConvexClient } from "@/lib/convex"
import { X402_CHAIN, X402_PAYTO_EVM, X402_PRICE, x402Server } from "@/lib/x402"

type CreatePayload = Record<string, unknown>

async function handler(request: Request) {
  let payload: CreatePayload
  try {
    payload = (await request.json()) as CreatePayload
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    )
  }

  const displayName =
    (payload.displayName as string | undefined) ??
    (payload.name as string | undefined) ??
    "Untitled agent"
  const ownerWallet =
    (payload.agentWallet as string | undefined) ??
    (payload.ownerWallet as string | undefined) ??
    "unknown-wallet"

  const client = getConvexClient()
  const id = (await client.mutation(anyApi.profiles.create, {
    displayName,
    ownerWallet,
    headline: payload.headline,
    prompt: payload.prompt,
    intent: payload.intent,
    context: payload.context,
    accessRules: payload.accessRules,
    structuredData: payload.structuredData ?? payload.profile,
  })) as string

  const origin = request.headers.get("origin") ?? new URL(request.url).origin
  const profileUrl = `${origin}/${id}`

  return NextResponse.json({
    id,
    profileUrl,
    status: "created",
  })
}

export const POST = withX402(
  handler,
  {
    accepts: [
      {
        scheme: "exact",
        network: X402_CHAIN,
        price: X402_PRICE,
        payTo: X402_PAYTO_EVM,
      },
    ],
    description: "Create an eigentic profile",
    mimeType: "application/json",
  },
  x402Server,
)
