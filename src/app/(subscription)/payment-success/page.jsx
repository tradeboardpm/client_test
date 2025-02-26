"use client"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"

const PaymentSuccessContent = () => {
  const searchQuery = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard")
    }, 5000) // 5000 milliseconds = 5 seconds

    return () => clearTimeout(timer) // Cleanup the timer if the component unmounts
  }, [router])

  if (!searchQuery) {
    return <div>Loading...</div>
  }

  const reference = searchQuery.get("reference")
  const plan = searchQuery.get("plan")

  return (
    <div className="flex items-center justify-center flex-col h-screen w-full">
      <div className="bg-muted p-8 rounded-lg shadow-inner">
        <h1 className="text-green-600 font-bold text-7xl">Payment Success</h1>
        <p className="text-lg bg-card w-fit px-3 rounded-lg mt-3">
          Reference ID:{" "}
          <span className="text-primary font-medium">{reference ? reference.toString() : "No reference found"}</span>
        </p>
        <p className="text-lg bg-card w-fit px-3 rounded-lg mt-3">
          Plan: <span className="text-primary font-medium">{plan ? plan.toString() : "No plan found"}</span>
        </p>
      </div>
    </div>
  )
}

const PaymentSuccess = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}

export default PaymentSuccess