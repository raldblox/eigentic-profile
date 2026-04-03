import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { demoScenarios } from "@/lib/demo-scenarios"

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
                Pay-to-create profiles that qualify before they unlock access.
              </h1>
              <p className="max-w-xl text-base text-muted-foreground md:text-lg">
                Submit one paid request to mint a public profile. The embedded
                representative qualifies visitors, protects sensitive contact
                details, and only opens the next step when the fit is clear.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/demo-profile">View demo profile</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://docs.openwallet.sh/doc.html?slug=quickstart">
                  Set up OWS
                </a>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Built for judges, founders, and agents that need access control,
              not another static profile page.
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Create
              </div>
              <button className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted">
                Refresh
              </button>
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-background px-4 py-5 text-xs leading-relaxed">
              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground">
{`ows pay request "https://eigentic-profile.vercel.app/api/profile/create" \\
  --wallet eigentti \\
  --method POST \\
  --body '{
    "ownerLabel": "Eigentic Labs",
    "displayName": "Eigen",
    "headline": "Agentic founder profile",
    "qualificationGoal": "Only schedule calls with founders over $20k MRR",
    "intent": "We fund pre-seed infrastructure teams",
    "context": "Only open the calendar after the founder proves fit.",
    "criteria": [
      "They are the founder or operator.",
      "They have at least $20k MRR or a credible equivalent.",
      "They want a private follow-up or demo."
    ],
    "gatedAssets": {
      "calendarUrl": "https://cal.com/raldblox/eigentic-demo",
      "email": "founders@eigentic.profile",
      "githubUrl": "https://github.com/raldblox/eigentic-profile"
    }
  }'`}
              </pre>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Replace the payload with your actual profile prompt, criteria,
              and gated assets. The owner wallet is derived from the payer.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {demoScenarios.map((scenario) => (
            <article
              key={scenario.id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {scenario.title}
              </p>
              <h2 className="mt-3 text-sm font-semibold leading-snug">
                {scenario.goal}
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {scenario.summary}
              </p>
              <div className="mt-4 text-xs text-foreground">
                Gated: {Object.keys(scenario.gatedAssets).join(", ")}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
