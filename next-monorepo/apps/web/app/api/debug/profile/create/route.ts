import { NextRequest, NextResponse } from "next/server"

import { anyApi, getConvexClient } from "@/lib/convex"

type CreatePayload = Record<string, unknown>

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
    route: "/api/debug/profile/create",
    origin,
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
    payloadKeys: Object.keys(payload),
  }
}

export async function POST(request: NextRequest) {
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
    (payload.ownerWallet as string | undefined) ??
    "debug-wallet"

  const origin = request.headers.get("origin") ?? new URL(request.url).origin
  const diagnostics = buildDiagnostics({
    payload,
    ownerWallet,
    ownerLabel,
    displayName,
    origin,
  })

  const client = getConvexClient()
  try {
    const id = (await client.mutation((anyApi as any).profiles.create, {
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

    return NextResponse.json({
      id,
      profileUrl: `${origin}/${id}`,
      status: "created",
      diagnostics,
    })
  } catch (error) {
    const errorDetails = {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      data:
        typeof error === "object" && error !== null
          ? (error as { data?: unknown }).data
          : undefined,
      diagnostics,
    }
    console.error("Debug Convex mutation failed", errorDetails)
    return NextResponse.json(
      {
        error: "Debug profile creation failed",
        details: JSON.stringify(errorDetails, null, 2),
      },
      { status: 500 },
    )
  }
}
