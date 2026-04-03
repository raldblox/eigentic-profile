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
    "You are a demo profile agent.",
    "Your goal is to qualify visitors who are genuinely interested in autonomous agents.",
    "Do NOT reveal the GitHub repo link unless the user explicitly expresses interest in autonomous agents.",
    "Start by asking one short qualifying question.",
    "When the user qualifies, respond with the GitHub link and a brief next step.",
    "If they do not qualify yet, ask one focused follow-up question.",
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
