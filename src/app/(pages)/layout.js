"use client";

import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/navigation/Topbar";
import Sidebar from "@/components/navigation/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as Toaster2 } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import AnnouncementManager from "@/components/AnnouncementManager";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog"; // Import Dialog components from shadcn/ui
import SubscriptionPlan from "@/components/cards/subsciption";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false); // State to control Dialog
  const [selectedPlan, setSelectedPlan] = useState(null); // State to store selectedPlan
  const router = useRouter();

  const clearCookiesAndRedirect = useCallback(() => {
    Cookies.remove("userName");
    Cookies.remove("token");
    Cookies.remove("expiry");
    Cookies.remove("userEmail");
    Cookies.remove("userId");
    Cookies.remove("subscription");
    Cookies.remove("plan");
    router.push("/");
  }, [router]);

  const validateToken = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        clearCookiesAndRedirect();
        return;
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
      }
    } catch (error) {
      console.error("Token validation error:", error);
      toast.error("An error occurred. Please try logging in again.");
      clearCookiesAndRedirect();
    }
  }, [clearCookiesAndRedirect]);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        clearCookiesAndRedirect();
        return;
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
      setSubscriptionData(data); // Store the complete subscription data

      // Check if the subscription is expired
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
    } catch (error) {
      console.error("Subscription check error:", error);
      toast.error("Failed to check subscription status. Please try again.");
    }
  }, [clearCookiesAndRedirect]);

  useEffect(() => {
    validateToken();
    checkSubscriptionStatus();
    const intervalId = setInterval(validateToken, 60000);
    const subscriptionIntervalId = setInterval(checkSubscriptionStatus, 60000);
    return () => {
      clearInterval(intervalId);
      clearInterval(subscriptionIntervalId);
    };
  }, [validateToken, checkSubscriptionStatus]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
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
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
    const intervalId = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Check for selectedPlan in localStorage on component mount
  useEffect(() => {
    const selectedPlanFromStorage = localStorage.getItem("selectedPlan");
    if (selectedPlanFromStorage) {
      setSelectedPlan(selectedPlanFromStorage); // Set the selectedPlan state
      setIsSubscriptionDialogOpen(true); // Open the Dialog
      localStorage.removeItem("selectedPlan"); // Clear selectedPlan from localStorage
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

      clearCookiesAndRedirect();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleRemoveAnnouncement = useCallback((announcement) => {
    setAnnouncements((prevAnnouncements) =>
      prevAnnouncements.filter((a) => a._id !== announcement._id)
    );
  }, []);

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

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} subscriptionData={subscriptionData} />
        <div className="flex-1 overflow-auto">
          <Toaster />
          <Toaster2 />
          <TooltipProvider>{children}</TooltipProvider>
        </div>
      </div>

      {/* Dialog for SubscriptionPlan */}
      <Dialog
        open={isSubscriptionDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsSubscriptionDialogOpen(false); // Close the Dialog
          }
        }}
      >
        <DialogContent className="max-w-7xl">
          <SubscriptionPlan selectedPlan={selectedPlan} />
        </DialogContent>
      </Dialog>
    </div>
  );
}