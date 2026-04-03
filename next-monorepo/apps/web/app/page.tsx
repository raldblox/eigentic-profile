import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <main className="min-h-dvh bg-background px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
        <nav className="flex items-center justify-between text-sm">
          <div className="font-semibold">eigentic-profile</div>
          <a
            href="https://github.com/raldblox/eigentic-profile"
            className="rounded-full border border-border px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] hover:bg-muted"
          >
            GitHub
          </a>
        </nav>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <div className="w-fit rounded-full border border-border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              OWS Hackathon
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Pay-to-create agent profiles that qualify before they unlock.
              </h1>
              <p className="max-w-xl text-base text-muted-foreground md:text-lg">
                Create a gated profile in a single paid request. The agent
                screens visitors, then reveals the next step only to qualified
                access.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/demo-profile">Demo profile</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://docs.openwallet.sh/doc.html?slug=quickstart">
                  Setup OWS
                </a>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Create
              </div>
              <button className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted">
                ⟳
              </button>
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-background px-4 py-5 text-xs leading-relaxed">
              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground">
{`ows pay request "https://profile.boreal.work/api/create" \\
  --wallet agent-wallet \\
  --method POST \\
  --body '{
    "displayName": "Eigen",
    "headline": "Agentic founder profile",
    "intent": "Only schedule calls with founders over $20k MRR",
    "context": "We fund pre-seed infrastructure teams"
  }'`}
              </pre>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Replace the payload with your real profile prompt and structured
              schema. This creates a public profile link after payment.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
