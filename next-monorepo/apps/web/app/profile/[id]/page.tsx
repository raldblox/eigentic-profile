import { notFound } from "next/navigation"

import { ProfileDetail, type ProfileDoc } from "@/components/profile-detail"
import { runConvexQuery } from "@/lib/convex"

export const dynamic = "force-dynamic"

export default async function ProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const profile = (await runConvexQuery<ProfileDoc | null>("profiles:get", {
    id: params.id,
  })) as ProfileDoc | null

  if (!profile) {
    notFound()
  }

  return <ProfileDetail profile={profile} />
}
