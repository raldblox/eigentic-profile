import { NextRequest, NextResponse } from "next/server"

import { runConvexQuery } from "@/lib/convex"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const profile = await runConvexQuery("profiles:get", {
    id,
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json(profile)
}
