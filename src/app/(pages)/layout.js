"use client";

import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/navigation/Topbar";
import Sidebar from "@/components/navigation/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as Toaster2 } from "@/components/ui/toaster";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import AnnouncementManager from "@/components/AnnouncementManager";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SubscriptionPlan from "@/components/cards/subsciption";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ===================================================================
  // 1. CLEAR LOCALSTORAGE ON SESSION EXPIRY (from middleware)
  // ===================================================================
  useEffect(() => {
    const sessionExpired = searchParams.get("session_expired");
    if (sessionExpired === "true") {
      // Save theme before clearing
      const theme = localStorage.getItem("theme") || "light";

      // Clear everything
      localStorage.clear();

      // Restore theme
      localStorage.setItem("theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Remove ?session_expired=true from URL without reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("session_expired");
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [searchParams, router]);
  // ===================================================================

  const clearCookiesAndRedirect = useCallback(() => {
    // Reset theme
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");

    // Clear all cookies
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });

    // Save theme before clearing localStorage
    const theme = localStorage.getItem("theme");

    // Clear localStorage
    localStorage.clear();

    // Restore theme
    localStorage.setItem("theme", theme || "light");

    // Redirect to home
    router.push("/");
  }, [router]);

  const validateToken = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        clearCookiesAndRedirect();
        return false;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/validate-token`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.error || data === false) {
        toast.error("Your session has expired. Please log in again.");
        clearCookiesAndRedirect();
        return false;
      }
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      toast.error("An error occurred. Please try logging in again.");
      clearCookiesAndRedirect();
      return false;
    }
  }, [clearCookiesAndRedirect]);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        clearCookiesAndRedirect();
        return false;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/subscription`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }

      const data = await response.json();
      setSubscriptionData(data);

      const currentDate = new Date();
      const expiresAt = new Date(data.expiresAt);

      if (expiresAt > currentDate) {
        Cookies.set("subscription", "true", { expires: 7 });
        Cookies.set("plan", data.plan, { expires: 7 });
      } else {
        Cookies.set("subscription", "false", { expires: 7 });
        Cookies.set("plan", data.plan, { expires: 7 });
        toast.error("Your subscription has expired. Please renew your subscription.");
      }
      return true;
    } catch (error) {
      console.error("Subscription check error:", error);
      toast.error("Failed to check subscription status. Please try again.");
      return false;
    }
  }, [clearCookiesAndRedirect]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/announcement`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();

        const notificationItems = data.filter(
          (item) => item.type === "notification"
        );
        const announcementItems = data.filter(
          (item) => item.type !== "notification"
        );

        setNotifications(notificationItems);
        setAnnouncements(announcementItems);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const [tokenValid, subscriptionValid, announcementsValid] = await Promise.all([
        validateToken(),
        checkSubscriptionStatus(),
        fetchAnnouncements(),
      ]);

      if (tokenValid && subscriptionValid && announcementsValid) {
        setLoading(false);

        const isFirstTimeLogin = localStorage.getItem("isFirstTimeLogin");
        if (isFirstTimeLogin === "true") {
          setIsSubscriptionDialogOpen(true);
          localStorage.setItem("isFirstTimeLogin", "false");
        }
      } else {
        setLoading(false);
      }
    };

    initializeData();

    const intervalId = setInterval(validateToken, 60000);
    const subscriptionIntervalId = setInterval(checkSubscriptionStatus, 60000);
    return () => {
      clearInterval(intervalId);
      clearInterval(subscriptionIntervalId);
    };
  }, [validateToken, checkSubscriptionStatus, fetchAnnouncements]);

  useEffect(() => {
    const selectedPlanFromStorage = localStorage.getItem("selectedPlan");
    if (selectedPlanFromStorage) {
      setSelectedPlan(selectedPlanFromStorage);
      setIsSubscriptionDialogOpen(true);
      localStorage.removeItem("selectedPlan");
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = Cookies.get("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Reset theme
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");

      // Clear cookies
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName);
      });

      // Save theme
      const theme = localStorage.getItem("theme");

      // Clear localStorage
      localStorage.clear();

      // Restore theme
      localStorage.setItem("theme", theme || "light");

      router.push("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleRemoveAnnouncement = useCallback((announcement) => {
    setAnnouncements((prevAnnouncements) =>
      prevAnnouncements.filter((a) => a._id !== announcement._id)
    );
  }, []);

  const handleCloseDialog = () => {
    setIsSubscriptionDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <AnnouncementManager
        announcements={announcements}
        onClose={handleRemoveAnnouncement}
      />

      <Topbar
        toggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        notifications={notifications}
      />

      <div className="flex flex-1 overflow-hidden pt-14">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          subscriptionData={subscriptionData}
        />
        <div className="flex-1 overflow-auto">
          <Toaster />
          <Toaster2 />
          <TooltipProvider>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
              </div>
            ) : (
              children
            )}
          </TooltipProvider>
        </div>
      </div>

      <Dialog
        open={isSubscriptionDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsSubscriptionDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-7xl">
          <SubscriptionPlan
            selectedPlan={selectedPlan}
            onCloseDialog={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}