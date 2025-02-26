"use client";

import { Suspense } from "react";
import OTPVerificationContent from "./otp-verification-content";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OTPVerificationPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-lg p-8 space-y-8">
      <Button
        variant="outline"
        className="mb-8 rounded-full size-10 p-0 absolute left-10 lg:left-32 top-20"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">OTP Verification</h1>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <OTPVerificationContent />
      </Suspense>
    </div>
  );
}
