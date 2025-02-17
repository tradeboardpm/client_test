"use client";

import ImageCarousel from "@/components/cards/ImageCarousel";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as Toaster2 } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import Cookies from "js-cookie";
import { Spinner } from "@/components/ui/spinner";

export default function AuthLayout({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/dashboard");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleHomeClick = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background relative">
      <button
        onClick={handleHomeClick}
        className="absolute top-4 left-4 z-10 bg-transparent border-2 border-secondary p-0  transition-colors overflow-hidden border-none rounded"
      >
        <img
          src="/images/Tradeboard_logo_RGB.png"
          alt="logo"
          className="h-7 object-cover p-1"
        />
      </button>
      <div className="flex-1 flex items-center justify-center">
        {children}
        <Toaster />
        <Toaster2 />
      </div>
      <div className="hidden md:flex md:w-1/2 primary_gradient py-12 px-6 rounded-l-[4rem]">
        <ImageCarousel />
      </div>
    </div>
  );
}
