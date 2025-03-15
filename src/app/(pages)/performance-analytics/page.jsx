"use client"

import { Suspense } from "react"
import TradeboardIntelligence from "./TradeboardIntelligence"
import JournalAnalysis from "./JournalAnalysis"

function LoadingComponent() {
  return <div className="text-center py-8">Loading...</div>
}

export default function PerformanceAnalytics() {
  return (
    <div className="bg-card min-h-screen">
      <Suspense fallback={<LoadingComponent />}>
        <TradeboardIntelligence />
        <JournalAnalysis />
      </Suspense>
    </div>
  )
}