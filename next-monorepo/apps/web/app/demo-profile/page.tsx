import { ProfileChat } from "@/components/profile-chat"

export default function DemoProfilePage() {
  return (
    <main className="min-h-svh bg-gradient-to-br from-white via-white to-muted/40 px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Demo profile
        </div>
        <ProfileChat
          profile={{
            displayName: "Eigen Demo",
            headline: "Qualify builders before sharing a private invite.",
          }}
          mode="live"
          endpoint="/api/demo/chat"
        />
      </div>
    </main>
  )
}
