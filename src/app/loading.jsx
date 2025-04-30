// app/loading.jsx
"use client";

import React from "react";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen bg-card">
      <div className="flex flex-col items-center space-y-4">
        <Spinner className="h-12 w-12" />
        {/* <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Loading your dashboard...
        </p> */}
      </div>
    </div>
  );
}