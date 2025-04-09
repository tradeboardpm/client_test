"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Cookies from "js-cookie";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Calculate expiry time
      const expiresInMs = data.expiresIn * 1000;
      const expiryTime = new Date(Date.now() + expiresInMs);

      // Cookie options
      const cookieOptions = {
        expires: expiryTime,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      };

      // Set cookies
      Cookies.set("token", data.token, cookieOptions);
      Cookies.set("userId", data.user._id, cookieOptions);
      Cookies.set("userName", data.user.name, cookieOptions);
      Cookies.set("userEmail", data.user.email, cookieOptions);
      Cookies.set("userPhone", data.user.phone, cookieOptions);
      Cookies.set("expiry", expiryTime.getTime().toString(), cookieOptions);

      // Show success toast
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred during login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-[500px] max-w-lg  space-y-8 p-8">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-20 rounded-full  p-2 lg:left-8 "
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="space-y-2 text-start">
          <h1 className="text-3xl font-semibold">Log in with Email</h1>
          <p className="text-sm text-muted-foreground">
            Enter your registered email and password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/login/email/forgot-password"
              className="text-sm  hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full text-background"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}