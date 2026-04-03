import { NextResponse } from "next/server"

import { api, getConvexClient } from "@/lib/convex"
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai"
import type { Id } from "@convex/_generated/dataModel"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatRequest = {
  messages: ChatMessage[]
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
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
  const profile = await client.query(api.profiles.get, {
    id: params.id as Id<"profiles">,
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  const systemPrompt = [
    "You are the profile agent for a pay-to-create profile.",
    "Your job is to qualify visitors before unlocking any private next step.",
    "Only approve visitors who match the intent and access rules.",
    "Respond with a short qualification response and ask one follow-up question.",
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
