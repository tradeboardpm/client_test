"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PasswordResetConfirmationPage() {
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
        <h1 className="text-3xl font-semibold">Password Reset</h1>
        <p className="text-muted-foreground text-sm">
          Your password has been successfully changed. Click here to log in.
        </p>
      </div>
      <Button
        onClick={() => router.push("/login")}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Log in
      </Button>
    </div>
  );
}
