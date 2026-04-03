import { NextRequest, NextResponse } from "next/server"
import { withX402 } from "@x402/next"

import { anyApi, getConvexClient } from "@/lib/convex"
import { X402_CHAIN, X402_PAYTO_EVM, X402_PRICE, x402Server } from "@/lib/x402"

type CreatePayload = Record<string, unknown>

async function handler(request: NextRequest): Promise<NextResponse> {
  let payload: CreatePayload
  try {
    payload = (await request.json()) as CreatePayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const displayName =
    (payload.displayName as string | undefined) ??
    (payload.name as string | undefined) ??
    "Anon"
  const ownerLabel =
    (payload.ownerLabel as string | undefined) ??
    (payload.principal as string | undefined) ??
    undefined
  const ownerWallet =
    request.headers.get("x402-payer") ??
    request.headers.get("x402-wallet") ??
    "unknown-wallet"

  const client = getConvexClient()
  let id: string
  try {
    id = (await client.mutation((anyApi as any).profiles.create, {
      displayName,
      ownerWallet,
      ownerLabel,
      headline: payload.headline,
      prompt: payload.prompt,
      qualificationGoal: payload.qualificationGoal,
      intent: payload.intent,
      context: payload.context,
      criteria: payload.criteria,
      gatedAssets: payload.gatedAssets,
      accessRules: payload.accessRules,
      structuredData: payload.structuredData ?? payload.profile,
    })) as string
  } catch (error) {
    console.error("Convex mutation failed", error)
    return NextResponse.json(
      {
        error: "Profile creation failed",
        details:
          error instanceof Error ? error.message : "Unknown Convex error",
      },
      { status: 500 },
    )
  }

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
  x402Server
)
