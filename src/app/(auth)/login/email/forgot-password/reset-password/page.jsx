"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function SetNewPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    // console.log("SetNewPassword params:", { resetToken, email });
    if (!resetToken || !email) {
      toast.error("Missing reset token or email");
      router.push("/login/email/forgot-password");
    }
  }, [resetToken, email, router]);

  // Validate password and update errors in real-time
  useEffect(() => {
    const errors = validatePassword(newPassword);
    setPasswordErrors(errors);

    if (newPassword && confirmPassword) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(true); // Reset when either field is empty
    }
  }, [newPassword, confirmPassword]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("an uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("a lowercase letter");
    if (!/\d/.test(password)) errors.push("a number");
    if (!/[!@#$%^&*]/.test(password))
      errors.push("a special character (!@#$%^&*)");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (passwordErrors.length > 0) {
      toast.error("Please fix password requirements");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resetToken, newPassword, email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      toast.success("Password reset successfully");
      router.push("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      newPassword &&
      confirmPassword &&
      passwordsMatch &&
      passwordErrors.length === 0
    );
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
        <h1 className="text-3xl font-semibold">Set a new password</h1>
        <p className="text-muted-foreground text-sm">
          Create a new password for {email}.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={`pr-10 ${
                (passwordErrors.length > 0 ||
                  (!passwordsMatch && confirmPassword)) &&
                "border-red-500"
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {passwordErrors.length > 0 && (
            <p className="text-red-500 text-sm">
              Password must include: {passwordErrors.join(", ")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`pr-10 ${
                !passwordsMatch && confirmPassword && "border-red-500"
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!passwordsMatch && confirmPassword && (
            <p className="text-red-500 text-sm">Passwords do not match</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isLoading || !isFormValid()}
        >
          {isLoading ? "Updating Password..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}

export default function SetNewPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetNewPasswordContent />
    </Suspense>
  );
}
