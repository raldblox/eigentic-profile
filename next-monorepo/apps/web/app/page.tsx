import { ProfileCreateForm } from "@/components/profile-create-form"
import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <main className="min-h-svh bg-gradient-to-br from-white via-white to-muted/40 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            OWS Hackathon Demo
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
              Pay-to-create agentic profiles that qualify before they unlock.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Create a public profile with x402, store it in Convex, and let the
              embedded agent decide who gets access to private next steps.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <a href="#create">Create a profile</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/demo-profile">View demo profile</a>
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            x402 price: 0.05 USD • Chain: Base mainnet • Facilitator: boreal.work
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Pay-to-create",
              body: "Every new profile is gated behind x402, so only funded requests create new entries.",
            },
            {
              title: "Prompt or structured data",
              body: "Submit a prompt, a structured profile object, or both. The agent uses either.",
            },
            {
              title: "Qualify before unlock",
              body: "Each profile link hosts a lightweight agent that screens visitors before revealing sensitive info.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </section>

        <section id="create" className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <ProfileCreateForm />
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              How it works
            </p>
            <ol className="mt-4 flex flex-col gap-4 text-sm text-muted-foreground">
              <li>
                1. Fund the create call with x402 and your agent wallet.
              </li>
              <li>
                2. Send prompt or structured profile data to the create route.
              </li>
              <li>3. Share the generated profile URL.</li>
              <li>
                4. Visitors must qualify through the profile agent chat to
                unlock the next step.
              </li>
            </ol>
            <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 text-xs">
              <div className="font-semibold text-foreground">
                OpenAI brain
              </div>
              <div className="mt-2 text-muted-foreground">
                Plug OpenAI into the chat route to evaluate intent and enforce
                access rules. The UI is already wired for it.
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-background p-4 text-xs">
              <div className="font-semibold text-foreground">
                OWS pay request snippet
              </div>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-muted/40 p-3 text-[11px] leading-relaxed">
{`# GET request — payment handled automatically
ows pay request "https://api.example.com/data" --wallet agent-treasury

# POST with a body
ows pay request "https://api.example.com/query" \\
  --wallet agent-treasury \\
  --method POST \\
  --body '{"prompt": "summarize this document"}'`}
              </pre>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Replace the URL with your create endpoint and adjust the body
                to match your profile payload.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
