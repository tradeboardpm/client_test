"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyToken } from "@/utils/ap-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function ApVerificationInner() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyToken(token)
        .then(() => {
          setIsVerified(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsVerified(false);
          setIsLoading(false);
        });
    } else {
      setIsVerified(false);
      setIsLoading(false);
    }
  }, [token]);

  const handleViewData = () => {
    router.push(`/ap-data?token=${token}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Accountability Partner Verification</CardTitle>
          <CardDescription>
            {isVerified
              ? "Your account has been verified successfully."
              : "There was an error verifying your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <p>You can now view the shared trading data.</p>
          ) : (
            <p>
              Please check your email for a valid verification link or contact
              support.
            </p>
          )}
        </CardContent>
        <CardFooter>
          {isVerified && (
            <Button onClick={handleViewData}>View Shared Data</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ApVerification() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <ApVerificationInner />
    </Suspense>
  );
}
