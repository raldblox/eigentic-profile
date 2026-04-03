import { ProfileChat } from "@/components/profile-chat"

type ProfileDoc = {
  _id: string
  displayName: string
  headline?: string | null
  prompt?: string | null
  intent?: string | null
  context?: string | null
  ownerLabel?: string | null
  qualificationGoal?: string | null
  criteria?: string[] | null
  gatedAssets?: unknown
  accessRules?: unknown
  structuredData?: unknown
  ownerWallet: string
}

export function ProfileDetail({ profile }: { profile: ProfileDoc }) {
  return (
    <div className="flex h-svh w-screen overflow-hidden bg-background">
      <div className="relative flex-1 flex flex-col h-full w-full">
        <ProfileChat
          profile={{
            displayName: profile.displayName,
            headline: profile.headline,
          }}
          profileId={profile._id}
          mode="live"
        />
      </div>
    </div>
  )
}

export type { ProfileDoc }
