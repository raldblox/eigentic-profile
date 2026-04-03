import { NextRequest, NextResponse } from "next/server"
import util from "node:util"
import { withX402 } from "@x402/next"

import { anyApi, getConvexClient } from "@/lib/convex"
import { X402_CHAIN, X402_PAYTO_EVM, X402_PRICE, x402Server } from "@/lib/x402"

type CreatePayload = Record<string, unknown>

function normalizeCriteria(criteria: unknown): string[] | undefined {
  if (!Array.isArray(criteria)) return undefined
  const values = criteria.filter((value): value is string => typeof value === "string")
  return values.length ? values : undefined
}

const X402_DEV_BYPASS = process.env.X402_DEV_BYPASS === "true"
const DEBUG_API_ERRORS =
  process.env.DEBUG_API_ERRORS === "true" ||
  process.env.NODE_ENV !== "production"

function buildDiagnostics({
  payload,
  ownerWallet,
  ownerLabel,
  displayName,
  origin,
}: {
  payload: CreatePayload
  ownerWallet: string
  ownerLabel?: string
  displayName: string
  origin: string
}) {
  const gatedAssets = payload.gatedAssets as Record<string, unknown> | undefined
  return {
    route: "/api/profile/create",
    origin,
    x402Bypass: X402_DEV_BYPASS,
    convexUrlHost: (() => {
      try {
        return new URL(process.env.CONVEX_URL ?? "").host
      } catch {
        return null
      }
    })(),
    ownerWallet,
    ownerLabel: ownerLabel ?? null,
    displayName,
    qualificationGoal: (payload.qualificationGoal as string | undefined) ?? null,
    hasCriteria: Array.isArray(payload.criteria),
    criteriaCount: Array.isArray(payload.criteria) ? payload.criteria.length : 0,
    hasGatedAssets: !!gatedAssets,
    gatedAssetKeys: gatedAssets ? Object.keys(gatedAssets) : [],
    accessRulesKeys:
      payload.accessRules && typeof payload.accessRules === "object"
        ? Object.keys(payload.accessRules as Record<string, unknown>)
        : [],
    payloadKeys: Object.keys(payload),
  }
}

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
  const origin = request.headers.get("origin") ?? new URL(request.url).origin
  const diagnostics = buildDiagnostics({
    payload,
    ownerWallet,
    ownerLabel,
    displayName,
    origin,
  })

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
      criteria: normalizeCriteria(payload.criteria),
      gatedAssets: payload.gatedAssets,
      accessRules: payload.accessRules,
      structuredData: payload.structuredData ?? payload.profile,
    })) as string
  } catch (error) {
    const ownKeys =
      error && typeof error === "object"
        ? Reflect.ownKeys(error).map((key) => String(key))
        : []
    const fullInspect =
      error && typeof error === "object"
        ? util.inspect(error, { depth: 5, breakLength: 120, showHidden: true })
        : String(error)
    const errorDetails = {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      constructorName:
        error && typeof error === "object" && "constructor" in error
          ? (error as { constructor?: { name?: string } }).constructor?.name
          : undefined,
      ownKeys,
      inspect: fullInspect,
      data:
        typeof error === "object" && error !== null
          ? (error as { data?: unknown }).data
          : undefined,
      diagnostics,
    }
    console.error("Convex mutation failed", errorDetails)
    return NextResponse.json(
      {
        error: "Profile creation failed",
        details: DEBUG_API_ERRORS
          ? JSON.stringify(errorDetails, null, 2)
          : "Convex mutation failed",
      },
      { status: 500 },
    )
  }

  const profileUrl = `${origin}/${id}`

  return NextResponse.json({
    id,
    profileUrl,
    status: "created",
  })
}

export const POST = X402_DEV_BYPASS
  ? handler
  : withX402(
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
