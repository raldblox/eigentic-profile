import { ProfileChat } from "@/components/profile-chat"
import { demoScenarios, getDemoScenario } from "@/lib/demo-scenarios"

export default function DemoProfilePage() {
  const activeScenario = getDemoScenario("autonomous-agents")

  return (
    <main className="min-h-svh bg-background px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Demo profile
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {demoScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`rounded-2xl border px-4 py-4 text-sm ${
                scenario.id === activeScenario.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">
                {scenario.title}
              </div>
              <p className="mt-2 text-xs leading-relaxed opacity-80">
                {scenario.summary}
              </p>
            </div>
          ))}
        </div>
        <ProfileChat
          profile={{
            displayName: activeScenario.title,
            headline: activeScenario.summary,
          }}
          mode="live"
          endpoint="/api/demo/chat"
          scenario={activeScenario}
        />
      </div>
    </main>
  )
}
