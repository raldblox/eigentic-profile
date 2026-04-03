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
}: {
  profile: ProfileSummary
  profileId?: string
  mode?: "live" | "demo"
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages)
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)

  const canSend = useMemo(
    () => input.trim().length > 3 && !busy,
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

    if (mode === "demo" || !profileId) {
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
      const response = await fetch(`/api/profile/${profileId}/chat`, {
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
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Profile Agent
        </p>
        <h2 className="text-xl font-semibold">{profile.displayName}</h2>
        {profile.headline && (
          <p className="text-sm text-muted-foreground">{profile.headline}</p>
        )}
      </div>
      <div className="mt-6 flex min-h-[280px] flex-col gap-4 rounded-2xl border border-border bg-background/60 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              message.role === "user"
                ? "self-end bg-primary text-primary-foreground"
                : "self-start bg-muted text-foreground"
            }`}
          >
            {message.content}
          </div>
        ))}
        {busy && (
          <div className="text-xs text-muted-foreground">Thinking...</div>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={3}
          placeholder="Explain your intent, proof, and why you qualify."
          className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex items-center gap-3">
          <Button onClick={onSend} disabled={!canSend}>
            {busy ? "Reviewing..." : "Send qualification"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Connect OpenAI here to make the agent enforce real rules.
          </span>
        </div>
      </div>
    </div>
  )
}
