import { NextResponse } from "next/server"

import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatRequest = {
  messages: ChatMessage[]
}

export async function POST(request: Request) {
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

  const systemPrompt = [
    "You are the appointed representative for a listed profile.",
    "Your job is to qualify visitors interested in autonomous agents and agentic workflows.",
    "Keep responses short. Ask one qualifying question at a time.",
    "If a message is unrelated, politely decline and redirect to the qualification.",
    "Do NOT reveal the GitHub repo link unless the user clearly expresses interest in autonomous agents.",
    "When they qualify, share the GitHub link and a brief next step.",
  ].join("\n")

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
