"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import PhoneNumberInput from "@/components/ui/phone-input";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login-phone`,
        {
          phone: phoneNumber, // This will now send the full phone number
        }
      );
      if (response.status === 200) {
        router.push(
          `/login/phone/verify-otp?phone=${encodeURIComponent(phoneNumber)}`
        );
      } else {
        console.error("Failed to send OTP");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-8">
      <Button
        variant="outline"
        className="mb-8 rounded-full size-10 p-0 absolute left-10 lg:left-32 top-20"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="space-y-2 text-start">
        <h1 className="text-3xl font-semibold">Log in with Mobile Number</h1>
        <p className="text-muted-foreground/65 text-sm">
          Please enter your registered mobile number
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <PhoneNumberInput
          label="Mobile Number"
          value={phoneNumber}
          onChange={setPhoneNumber}
          required
        />
        <Button
          type="submit"
          className="w-full text-background"
          disabled={isLoading}
        >
          {isLoading ? "Sending OTP..." : "Send OTP"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/sign-up" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}