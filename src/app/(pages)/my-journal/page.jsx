// Server Component (no "use client")
import { Suspense } from "react"
import Cookies from "js-cookie"
import ClientJournalPage from "./ClientJournalPage"
import JournalCardSkeleton from "@/components/cards/JournalCardSkeleton"


// Default export for the page
export default function JournalPage({ searchParams }) {
  // Extract year and month from searchParams (provided by Next.js)
  const year = searchParams?.year ? parseInt(searchParams.year) : null
  const month = searchParams?.month ? parseInt(searchParams.month) - 1 : null
  const cookieDate = Cookies.get("journalDate")

  // Default to current date
  let initialDate = new Date()

  // Try parsing cookie date first
  if (cookieDate) {
    try {
      const parsedDate = new Date(JSON.parse(cookieDate))
      if (!isNaN(parsedDate.getTime())) {
        initialDate = parsedDate
      }
    } catch (e) {
      console.error("Failed to parse cookie date:", e)
    }
  }
  // Then try searchParams if provided
  else if (year !== null && month !== null && !isNaN(year) && !isNaN(month)) {
    const parsedDate = new Date(year, month)
    if (!isNaN(parsedDate.getTime())) {
      initialDate = parsedDate
    }
  }

  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8)
            .fill(null)
            .map((_, index) => (
              <JournalCardSkeleton key={`skeleton-${index}`} />
            ))}
        </div>
      }
    >
      <ClientJournalPage initialDate={initialDate} />
    </Suspense>
  )
}