"use client"

import { useMemo, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

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
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h2 className="text-sm font-medium">{profile.displayName}</h2>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Profile Agent • Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scenario && (
             <span className="hidden sm:inline-flex rounded-full border border-border px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
               {scenario.title}
             </span>
          )}
          <div className="text-[10px] text-muted-foreground font-mono">x402:v2</div>
        </div>
      </div>

      {/* Hero / Context (Optional, could be moved to sidebar or top of chat) */}
      {/* For ChatGPT style, we usually have a clean start. I'll put headline at the very top of messages or in the header. */}

      {/* Chat Messages */}
      <ChatContainerRoot className="flex-1 px-4 py-8 md:px-0">
        <div className="mx-auto max-w-3xl w-full">
          <ChatContainerContent className="gap-8">
            {/* Initial Welcome / Profile Info */}
            <div className="mb-4 px-4 py-6 rounded-2xl bg-muted/30 border border-border/50">
              <h1 className="text-2xl font-semibold mb-2">{profile.displayName}</h1>
              {profile.headline && (
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                  {profile.headline}
                </p>
              )}
              {scenario && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.keys(scenario.gatedAssets).map((asset) => (
                    <span
                      key={asset}
                      className="rounded-full bg-background border border-border px-2.5 py-1 text-[10px] font-medium text-foreground/70"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full gap-4 px-4",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border text-[10px] font-bold uppercase",
                  message.role === "assistant"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border"
                )}>
                  {message.role === "assistant" ? "AI" : "ME"}
                </div>
                <div className={cn(
                  "flex flex-col gap-2 max-w-[85%] sm:max-w-[75%]",
                  message.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    message.role === "user"
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-background border border-border text-foreground"
                  )}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex gap-4 px-4">
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold border border-primary">
                  AI
                </div>
                <div className="text-xs text-muted-foreground italic flex items-center min-h-[32px]">
                  <span>Generating response...</span>
                </div>
              </div>
            )}
            <ChatContainerScrollAnchor />
          </ChatContainerContent>
        </div>
      </ChatContainerRoot>

      {/* Input Area */}
      <div className="w-full bg-gradient-to-t from-background via-background/90 to-transparent pt-10 pb-6 sticky bottom-0">
        <div className="mx-auto max-w-3xl w-full px-4">
          <PromptInput
            value={input}
            onValueChange={setInput}
            onSubmit={onSend}
            isLoading={busy}
            className="group relative flex flex-col space-y-2 rounded-2xl border border-input bg-background p-2 pr-12 focus-within:ring-1 focus-within:ring-ring transition-all"
          >
            <PromptInputTextarea
              placeholder="Ask anything or provide your qualifications..."
              className="px-2 py-1"
            />
            <div className="absolute right-3 bottom-3">
               <Button
                onClick={onSend}
                disabled={!canSend}
                size="icon"
                className="h-8 w-8 rounded-xl"
              >
                {busy ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m5 12 7-7 7 7" />
                    <path d="M12 19V5" />
                  </svg>
                )}
              </Button>
            </div>
            <div className="text-[10px] text-center text-muted-foreground/60 w-full pt-1">
              Eigentic Agent can reveal gated info, calendar, or email upon qualification.
            </div>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
