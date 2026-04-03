import { NextResponse } from "next/server"

import { api, getConvexClient } from "@/lib/convex"
import type { Id } from "@convex/_generated/dataModel"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const client = getConvexClient()
  const profile = await client.query(api.profiles.get, {
    id: params.id as Id<"profiles">,
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json(profile)
}
