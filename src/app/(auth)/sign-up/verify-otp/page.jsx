"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function OTPVerification() {
  const [emailOTP, setEmailOTP] = useState("");
  const [phoneOTP, setPhoneOTP] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("email");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const phone = localStorage.getItem("userPhone");
    if (!email || !phone) {
      router.push("/sign-up");
    }
  }, [router]);

  const handleVerifyEmailOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: localStorage.getItem("userEmail"),
            otp: emailOTP,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Email OTP verification failed");
      }

      toast.success("Email verified successfully");
      setStep("phone");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-phone-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: localStorage.getItem("userPhone"),
            otp: phoneOTP,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Phone OTP verification failed");
      }

      toast.success("Phone verified successfully");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPhone");
      setIsSuccessDialogOpen(true);
      setTimeout(() => {
        setIsSuccessDialogOpen(false);
        router.push("/login");
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-2">
      <Card className="w-full max-w-lg bg-transparent shadow-none">
        <CardContent className="px-2 py-3">
          <h1 className="text-3xl font-semibold mb-2">Verify OTP</h1>
          <p className="text-gray-300 mb-6">
            {step === "email"
              ? "Please enter the OTP sent to your email"
              : "Please enter the OTP sent to your phone"}
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "email" ? (
            <form className="space-y-4" onSubmit={handleVerifyEmailOTP}>
              <div>
                <Label htmlFor="emailOTP">Email OTP</Label>
                <Input
                  className="text-base h-10"
                  id="emailOTP"
                  value={emailOTP}
                  onChange={(e) => setEmailOTP(e.target.value)}
                  required
                />
              </div>
              <Button
                className="w-full text-background"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Email OTP"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleVerifyPhoneOTP}>
              <div>
                <Label htmlFor="phoneOTP">Phone OTP</Label>
                <Input
                  className="text-base h-10"
                  id="phoneOTP"
                  value={phoneOTP}
                  onChange={(e) => setPhoneOTP(e.target.value)}
                  required
                />
              </div>
              <Button
                className="w-full text-background"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Phone OTP"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="flex flex-col items-center">
          <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
          <h2 className="text-2xl font-semibold">Account Created Successfully!</h2>
          <p className="text-gray-500 mt-2">Redirecting to login...</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
