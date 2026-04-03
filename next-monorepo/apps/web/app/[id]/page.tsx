import { redirect } from "next/navigation"

export default async function LegacyProfilePage({
  params,
}: {
  params: { id: string }
}) {
  redirect(`/profile/${params.id}`)
}
