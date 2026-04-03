"use client"

import { useMemo, useState, useTransition } from "react"

import { Button } from "@workspace/ui/components/button"

type CreateResponse = {
  id: string
  profileUrl: string
  status: string
}

type ErrorResponse = {
  error: string
  details?: string
  facilitator?: string
  amountUsd?: number
  chain?: string
}

const sampleStructured = `{
  "agentWallet": "agent-treasury",
  "displayName": "Eigen",
  "headline": "Agentic founder profile",
  "intent": "Only schedule calls with founders over $20k MRR",
  "context": "We fund pre-seed infrastructure teams",
  "accessRules": {
    "requires": ["startup", "revenue"],
    "minRevenue": 20000
  }
}`

export function ProfileCreateForm() {
  const [pending, startTransition] = useTransition()
  const [payload, setPayload] = useState(sampleStructured)
  const [result, setResult] = useState<CreateResponse | null>(null)
  const [error, setError] = useState<ErrorResponse | null>(null)

  const isJsonValid = useMemo(() => {
    try {
      JSON.parse(payload)
      return true
    } catch {
      return false
    }
  }, [payload])

  const onSubmit = () => {
    setResult(null)
    setError(null)

    if (!isJsonValid) {
      setError({ error: "Invalid JSON", details: "Fix the payload first." })
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/profile/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: payload,
        })

        if (!response.ok) {
          const data = (await response.json()) as ErrorResponse
          setError(data)
          return
        }

        const data = (await response.json()) as CreateResponse
        setResult(data)
      } catch (err) {
        setError({
          error: "Request failed",
          details: err instanceof Error ? err.message : "Unknown error",
        })
      }
    })
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Create Profile (x402)
        </p>
        <h3 className="text-lg font-semibold">Pay-to-create profile payload</h3>
        <p className="text-sm text-muted-foreground">
          Paste a prompt or structured profile payload. The create route returns
          a public profile URL.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          rows={12}
          className="min-h-[220px] w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onSubmit} disabled={pending || !isJsonValid}>
            {pending ? "Creating..." : "Create profile"}
          </Button>
          {!isJsonValid && (
            <span className="text-xs text-destructive">
              Invalid JSON payload.
            </span>
          )}
        </div>
        {result && (
          <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
            <div className="font-medium">Profile created</div>
            <div className="mt-2 text-xs text-muted-foreground">
              ID: {result.id}
            </div>
            <a
              href={result.profileUrl}
              className="mt-2 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Open profile
            </a>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
            <div className="font-medium">{error.error}</div>
            {error.details && <div className="mt-1">{error.details}</div>}
            {error.facilitator && (
              <div className="mt-2 text-[11px] text-destructive/80">
                Facilitator: {error.facilitator} • {error.amountUsd} USD •{" "}
                {error.chain}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
