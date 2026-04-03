"use client"

import { useMemo, useState } from "react"

import { Button } from "@workspace/ui/components/button"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

type ProfileSummary = {
  displayName: string
  headline?: string | null
}

const seedMessages: ChatMessage[] = [
  {
    id: "seed-1",
    role: "assistant",
    content:
      "Tell me what you are building and why this profile should unlock a next step.",
  },
]

export function ProfileChat({
  profile,
  profileId,
  mode = "live",
  endpoint,
}: {
  profile: ProfileSummary
  profileId?: string
  mode?: "live" | "demo"
  endpoint?: string
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages)
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
        <div className="text-xs text-muted-foreground">x402 • qualified</div>
      </div>

      <div className="px-6 pt-4">
        {profile.headline && (
          <p className="text-sm text-muted-foreground">{profile.headline}</p>
        )}
      </div>

      <div className="px-6 pb-6 pt-4">
        <div className="flex min-h-[320px] flex-col gap-4 rounded-2xl border border-border bg-background p-4">
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
        </div>
      </div>

      <div className="border-t border-border px-6 py-4">
        <div className="flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void onSend()
              }
            }}
            rows={3}
            placeholder="Explain your intent, proof, and why you qualify."
            className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button onClick={onSend} disabled={!canSend}>
              {busy ? "Reviewing..." : "Send qualification"}
            </Button>
            <span className="text-xs text-muted-foreground">
              The agent will only reveal the next step when you qualify.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
