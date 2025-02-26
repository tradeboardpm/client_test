import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Card className="flex flex-col p-6 max-w-md w-full shadow-lg rounded-lg bg-white">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-600 text-center mb-6">
          Oops! The page you're looking for does not exist.
        </p>
        <Link
          className="text-white bg-primary hover:bg-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg p-3 flex gap-2 items-center justify-center transition-all duration-300"
          href="/dashboard"
          aria-label="Go to dashboard"
        >
          <Home size={16} />
          Home
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
