"use client"

import { useMemo, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@workspace/ui/components/chat-container"
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@workspace/ui/components/prompt-input"
import type { DemoScenario } from "@/lib/demo-scenarios"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

type ProfileSummary = {
  displayName: string
  headline?: string | null
}

export function ProfileChat({
  profile,
  profileId,
  mode = "live",
  endpoint,
  scenario,
}: {
  profile: ProfileSummary
  profileId?: string
  mode?: "live" | "demo"
  endpoint?: string
  scenario?: DemoScenario
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "seed-1",
      role: "assistant",
      content:
        scenario?.qualifierQuestion ??
        "Tell me what you are building and why this profile should unlock access.",
    },
  ])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)

  const canSend = useMemo(
    () => input.trim().length > 0 && !busy,
    [input, busy],
  )

  const onSend = async () => {
    if (!canSend) return

    const nextMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, nextMessage])
    setInput("")
    setBusy(true)

    if (mode === "demo" && !endpoint) {
      await new Promise((resolve) => setTimeout(resolve, 650))
      const response: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "Thanks. I will check this against the profile requirements. If you qualify, I will share the next step.",
      }
      setMessages((prev) => [...prev, response])
      setBusy(false)
      return
    }

    try {
      const target =
        endpoint ?? (profileId ? `/api/profile/${profileId}/chat` : null)
      if (!target) {
        throw new Error("Missing chat endpoint")
      }

      const response = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario?.id,
          messages: [...messages, nextMessage].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      })

      if (!response.ok) {
        const errorPayload = (await response.json()) as { error?: string }
        throw new Error(errorPayload?.error ?? "Chat request failed")
      }

      const data = (await response.json()) as { reply: string }
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          err instanceof Error
            ? `Error: ${err.message}`
            : "Error: unable to reach the agent.",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Profile Agent
            </div>
            <h2 className="text-lg font-semibold">{profile.displayName}</h2>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">x402 | qualified</div>
      </div>

      <div className="px-6 pt-4">
        {profile.headline && (
          <p className="text-sm text-muted-foreground">{profile.headline}</p>
        )}
        {scenario && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {scenario.title}
            </span>
            {Object.keys(scenario.gatedAssets).map((asset) => (
              <span
                key={asset}
                className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
              >
                {asset}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-4">
        <ChatContainerRoot className="min-h-[320px] rounded-2xl border border-border bg-background p-4">
          <ChatContainerContent className="gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[80%] rounded-2xl border border-border px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "self-end bg-muted text-foreground"
                    : "self-start bg-card text-foreground"
                }`}
              >
                {message.content}
              </div>
            ))}
            {busy && (
              <div className="text-xs text-muted-foreground">Thinking...</div>
            )}
            <ChatContainerScrollAnchor />
          </ChatContainerContent>
        </ChatContainerRoot>
      </div>

      <div className="border-t border-border px-6 py-4">
        <div className="flex flex-col gap-3">
          <PromptInput
            value={input}
            onValueChange={setInput}
            onSubmit={onSend}
            isLoading={busy}
            className="rounded-2xl border border-border bg-background px-4 py-2"
          >
            <PromptInputTextarea placeholder="Explain your intent, proof, and why you qualify." />
            <PromptInputActions className="justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                The agent only reveals the next step when you qualify.
              </span>
              <Button onClick={onSend} disabled={!canSend}>
                {busy ? "Reviewing..." : "Send"}
              </Button>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
