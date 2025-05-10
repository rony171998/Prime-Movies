import { getGuestSessionId } from "@/app/actions"
import { getSessionId, getAccountDetails } from "@/app/auth-actions"
import { WatchPageClient } from "@/components/watch-page-client"

export default async function WatchPage({ searchParams }) {
  const movieId = searchParams.id

  // Get session and account details
  const sessionId = await getSessionId()
  const accountDetails = sessionId ? await getAccountDetails() : null
  const guestSessionId = !sessionId ? await getGuestSessionId() : null

  return (
    <WatchPageClient
      movieId={movieId}
      guestSessionId={guestSessionId}
      sessionId={sessionId}
      accountDetails={accountDetails}
    />
  )
}
