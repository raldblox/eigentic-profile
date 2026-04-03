import { NextRequest, NextResponse } from "next/server"

import { api, getConvexClient } from "@/lib/convex"
import type { Id } from "@convex/_generated/dataModel"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const client = getConvexClient()
  const profile = await client.query(api.profiles.get, {
    id: id as Id<"profiles">,
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json(profile)
}
