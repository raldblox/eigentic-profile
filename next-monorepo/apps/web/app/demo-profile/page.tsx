"use client"
import { useState, useMemo } from "react"
import { ProfileChat } from "@/components/profile-chat"
import { demoScenarios, getDemoScenario } from "@/lib/demo-scenarios"
import { cn } from "@workspace/ui/lib/utils"

export default function DemoProfilePage() {
  const [activeScenarioId, setActiveScenarioId] = useState(demoScenarios[0]!.id)
  const activeScenario = useMemo(() => getDemoScenario(activeScenarioId), [activeScenarioId])

  return (
    <main className="flex h-svh w-screen overflow-hidden bg-background">
      {/* Scenario Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col border-r border-border bg-muted/20 overflow-y-auto">
        <div className="p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 mb-1">
            Demo Scenarios
          </div>
          <h1 className="text-sm font-semibold">Testing Different Flows</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {demoScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setActiveScenarioId(scenario.id)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all duration-200 group relative",
                activeScenarioId === scenario.id
                  ? "bg-muted shadow-sm ring-1 ring-border"
                  : "hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "text-[10px] uppercase tracking-wider font-bold mb-1 transition-colors",
                activeScenarioId === scenario.id ? "text-primary" : "text-muted-foreground"
              )}>
                {scenario.title}
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground/80 line-clamp-2">
                {scenario.summary}
              </p>
              {activeScenarioId === scenario.id && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-border bg-muted/40">
          <div className="text-[10px] text-muted-foreground">
            Switching a scenario updates the agent's prompts and criteria instantly.
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full">
         <div className="lg:hidden p-4 border-b border-border bg-background sticky top-0 z-20">
            <select 
               value={activeScenarioId} 
               onChange={(e) => setActiveScenarioId(e.target.value)}
               className="w-full bg-muted p-2 rounded-lg text-sm font-medium border-none focus:ring-1 focus:ring-primary"
            >
               {demoScenarios.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
               ))}
            </select>
         </div>
        <ProfileChat
          key={activeScenario.id} // Key ensures component remounts and resets state on switch
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
