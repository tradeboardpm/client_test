"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LoginOptionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`,
        {
          token: credentialResponse.credential,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token, user, expiresIn } = response.data;

      Cookies.set("token", token, {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("expiry", String(Date.now() + expiresIn * 1000), {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("userEmail", user.email, {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("userName", user.name, {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("userId", user._id, {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
      setShowGoogleDialog(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed");
    setIsLoading(false);
    setShowGoogleDialog(false);
  };

  const CustomGoogleButton = ({ onClick }) => (
    <Button
      variant="ghost"
      className="w-full bg-[#F3F6F8] dark:bg-[#434445] justify-center border dark:border-[#303031] border-[#E7E7EA] font-medium text-[0.875rem] shadow-[0px_6px_16px_rgba(0,0,0,0.04)] py-[20px] hover:bg-[#E9EEF0] dark:hover:bg-[#4d4e4f]"
      onClick={onClick}
      disabled={isLoading}
    >
      <Image
        src="/images/google.svg"
        alt="Google"
        width={20}
        height={20}
        className="mr-2"
      />
      Log in with Google
    </Button>
  );

  const DummyGoogleButton = () => (
    <Button
      variant="ghost"
      className="w-full bg-[#F3F6F8] dark:bg-[#434445] justify-center border dark:border-[#303031] border-[#E7E7EA] font-medium text-[0.875rem] shadow-[0px_6px_16px_rgba(0,0,0,0.04)] py-[20px] hover:bg-[#E9EEF0] dark:hover:bg-[#4d4e4f]"
      onClick={() => setShowGoogleDialog(true)}
      disabled={isLoading}
    >
      <Image
        src="/images/google.svg"
        alt="Google"
        width={20}
        height={20}
        className="mr-2"
      />
      Log in with Google
    </Button>
  );

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <div className="relative min-h-screen flex items-center justify-center bg-background">
        <div className={`w-full max-w-md px-4 sm:max-w-lg space-y-8 ${isLoading ? "blur-sm" : ""}`}>
          <div className="space-y-2 text-start">
            <h1 className="text-2xl sm:text-3xl font-semibold">Log in to your account</h1>
            <p className="text-muted-foreground/65 text-sm">
              Please select any one of the options below
            </p>
          </div>
          <div className="space-y-4">
            <DummyGoogleButton />

            <Button
              variant="ghost"
              className="w-full bg-[#F3F6F8] dark:bg-[#434445] justify-center border dark:border-[#303031] border-[#E7E7EA] font-medium text-[0.875rem] shadow-[0px_6px_16px_rgba(0,0,0,0.04)] py-[20px] hover:bg-[#E9EEF0] dark:hover:bg-[#4d4e4f]"
              onClick={() => router.push("/login/email")}
              disabled={isLoading}
            >
              <Mail className="h-5 mr-2" />
              Log in with Email
            </Button>

            <Button
              variant="ghost"
              className="w-full bg-[#F3F6F8] dark:bg-[#434445] justify-center border dark:border-[#303031] border-[#E7E7EA] font-medium text-[0.875rem] shadow-[0px_6px_16px_rgba(0,0,0,0.04)] py-[20px] hover:bg-[#E9EEF0] dark:hover:bg-[#4d4e4f]"
              onClick={() => router.push("/login/phone")}
              disabled={isLoading}
            >
              <Phone className="h-5 mr-2" />
              Log in with Mobile Number
            </Button>
          </div>

          <p className="text-center text-sm text-[#A6A8B1]">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-primary"></div>
          </div>
        )}

        <Dialog open={showGoogleDialog} onOpenChange={setShowGoogleDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Continue with Google</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                By continuing with Google, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="pb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                disabled={isLoading}
                render={({ onClick }) => <CustomGoogleButton onClick={onClick} />}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </GoogleOAuthProvider>
  );
}