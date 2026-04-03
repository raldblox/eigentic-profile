import { NextRequest, NextResponse } from "next/server"

import { anyApi, getConvexClient } from "@/lib/convex"
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai"
import { buildQualificationPrompt } from "@/lib/qualification-prompt"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatRequest = {
  messages: ChatMessage[]
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  let payload: ChatRequest
  try {
    payload = (await request.json()) as ChatRequest
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!payload.messages?.length) {
    return NextResponse.json(
      { error: "Messages are required" },
      { status: 400 },
    )
  }

  const client = getConvexClient()
  const profile = await client.query((anyApi as any).profiles.get, {
    id,
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  const systemPrompt = [
    buildQualificationPrompt({
      representativeName: "Profile Representative",
      profileName: profile.displayName,
      ownerLabel: profile.ownerLabel ?? "the profile owner",
      goal: profile.qualificationGoal ?? profile.intent ?? profile.headline,
      summary: profile.context ?? profile.prompt ?? profile.headline,
      criteria: profile.criteria ?? null,
      gatedAssets: profile.gatedAssets ?? null,
      qualifierQuestion:
        profile.prompt ??
        "What makes you the right visitor for this profile?",
      successMessage:
        "Great. You are qualified, and I can unlock the next step.",
    }),
    profile.accessRules
      ? `Additional access rules (structured): ${JSON.stringify(profile.accessRules)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n")

  const openai = getOpenAIClient()
  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: [
      {
        role: "developer",
        content: systemPrompt,
      },
      ...payload.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ],
  })

  return NextResponse.json({
    reply: response.output_text ?? "No response text returned.",
    responseId: response.id,
  })
}
