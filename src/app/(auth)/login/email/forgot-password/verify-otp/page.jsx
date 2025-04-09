"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function VerifyOTPContent() {
  const [otp, setOTP] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const emailParam = searchParams.get("email");
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      } else {
        router.push("/login/email/forgot-password");
      }
    }
  }, [router]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-forgot-password-otp`, // Correct endpoint
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP verified successfully");
        console.log("Response from verify-forgot-password-otp:", data);

        if (!data.resetToken) {
          throw new Error("No reset token received from server");
        }

        const redirectUrl = `/login/email/forgot-password/reset-password?token=${encodeURIComponent(
          data.resetToken
        )}&email=${encodeURIComponent(email)}`;
        console.log("Redirecting to:", redirectUrl);
        router.push(redirectUrl);
      } else {
        throw new Error(data.error || "Failed to verify OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-email-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("New OTP sent successfully");
        setResendTimer(60);
      } else {
        throw new Error(data.error || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error(error.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-8">
       <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-20 rounded-full  p-2 lg:left-8 "
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Verify OTP</h1>
        <p className="text-muted-foreground text-sm">
          Please enter the OTP sent to your email
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="otp">OTP</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>
      <div className="text-center">
        <Button
          variant="link"
          onClick={handleResendOTP}
          disabled={isResending || resendTimer > 0}
        >
          {resendTimer > 0
            ? `Resend OTP in ${resendTimer}s`
            : isResending
            ? "Resending..."
            : "Resend OTP"}
        </Button>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}