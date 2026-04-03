import { NextResponse } from "next/server"

import { anyApi, getConvexClient } from "@/lib/convex"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const client = getConvexClient()
  const profile = await client.query(anyApi.profiles.get, {
    id: params.id,
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json(profile)
}
