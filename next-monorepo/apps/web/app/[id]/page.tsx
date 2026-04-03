import { notFound } from "next/navigation"

import { ProfileChat } from "@/components/profile-chat"
import { anyApi, getConvexClient } from "@/lib/convex"

export const dynamic = "force-dynamic"

type ProfileDoc = {
  _id: string
  displayName: string
  headline?: string | null
  prompt?: string | null
  intent?: string | null
  context?: string | null
  accessRules?: unknown
  structuredData?: unknown
  ownerWallet: string
}

export default async function ProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const client = getConvexClient()
  const profile = (await client.query(anyApi.profiles.get, {
    id: params.id,
  })) as ProfileDoc | null

  if (!profile) {
    notFound()
  }

  return (
    <main className="min-h-svh bg-gradient-to-br from-white via-white to-muted/40 px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Profile #{profile._id}
        </div>
        <ProfileChat
          profile={{
            displayName: profile.displayName,
            headline: profile.headline,
          }}
          profileId={profile._id}
          mode="live"
        />
        <section className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          <h3 className="text-base font-semibold text-foreground">
            Profile context
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Intent
              </div>
              <p className="mt-1">{profile.intent ?? "Not provided"}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Context
              </div>
              <p className="mt-1">{profile.context ?? "Not provided"}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Owner wallet: {profile.ownerWallet}
          </div>
        </section>
      </div>
    </main>
  )
}
