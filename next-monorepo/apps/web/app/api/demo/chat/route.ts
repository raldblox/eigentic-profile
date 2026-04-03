import { NextResponse } from "next/server"

import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai"
import { buildQualificationPrompt } from "@/lib/qualification-prompt"
import { getDemoScenario } from "@/lib/demo-scenarios"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatRequest = {
  messages: ChatMessage[]
  scenarioId?: string
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

  const scenario = getDemoScenario(payload.scenarioId ?? "autonomous-agents")
  const systemPrompt = buildQualificationPrompt({
    representativeName: "Eigen Demo Representative",
    profileName: scenario.title,
    ownerLabel: "the profile owner",
    goal: scenario.goal,
    summary: scenario.summary,
    criteria: scenario.criteria,
    gatedAssets: scenario.gatedAssets,
    qualifierQuestion: scenario.qualifierQuestion,
    successMessage: scenario.successMessage,
  })

  const openai = getOpenAIClient()
  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: [
      {
        role: "developer",
        content: `${systemPrompt}\n\nThe visitor is using the demo scenario titled "${scenario.title}".`,
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
