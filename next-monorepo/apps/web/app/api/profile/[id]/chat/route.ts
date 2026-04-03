import { NextRequest, NextResponse } from "next/server"

import { anyApi, getConvexClient } from "@/lib/convex"
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai"

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
    "You are the appointed representative for a listed profile.",
    "Your job is to qualify visitors before unlocking any private next step.",
    "Keep replies short, ask one qualifying question at a time.",
    "If the user asks unrelated questions, decline briefly and redirect to the qualification.",
    "Only approve visitors who match the intent and access rules.",
    "",
    `Profile name: ${profile.displayName}`,
    profile.headline ? `Headline: ${profile.headline}` : null,
    profile.intent ? `Intent: ${profile.intent}` : null,
    profile.context ? `Context: ${profile.context}` : null,
    profile.accessRules
      ? `Access rules (structured): ${JSON.stringify(profile.accessRules)}`
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
