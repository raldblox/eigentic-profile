import { NextRequest, NextResponse } from "next/server"

import { anyApi, getConvexClient } from "@/lib/convex"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const client = getConvexClient()
  const profile = await client.query((anyApi as any).profiles.get, {
    id,
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json(profile)
}
