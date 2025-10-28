"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useToast } from "@/hooks/use-toast";
import PersonalDetailsSection from "./PersonalDetailsSection";
import PasswordSection from "./PasswordSection";
import DashboardSettingsSection from "./DashboardSettingsSection";
import SubscriptionPlanSection from "./SubscriptionPlanSection";
import CreatePasswordSection from "./CreatePasswordSection";
import AddPhoneSection from "./AddPhoneSection";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Monitor, MonitorX } from "lucide-react";

// Axios instance with interceptor
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchSettings();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/user/profile");
      setUser(response.data);
      setIsGoogleUser(!!response.data.googleId);
      Cookies.set("userName", response.data.name || "", { expires: 7 });
      Cookies.set("userEmail", response.data.email || "", { expires: 7 });
      Cookies.set("userPhone", response.data.phone || "", { expires: 7 });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch user data",
        variant: "destructive",
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get("/user/settings");
      setSettings(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch settings",
        variant: "destructive",
      });
    }
  };

  // ===================================================================
  // REUSABLE: Clear Cookies + localStorage + Preserve Theme + Redirect
  // ===================================================================
  const clearAuthAndRedirect = (redirectTo = "/login") => {
    // 1. Reset theme to light
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");

    // 2. Clear ALL cookies
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });

    // 3. Save current theme before clearing localStorage
    const currentTheme = localStorage.getItem("theme") || "light";

    // 4. Clear ALL localStorage
    localStorage.clear();

    // 5. Restore theme
    localStorage.setItem("theme", currentTheme);
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    }

    // 6. Redirect
    router.push(redirectTo);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast({ title: "Success", description: "Logged out successfully" });
      clearAuthAndRedirect("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive",
      });
    }
  };

  const handleLogoutAll = async () => {
    try {
      await api.post("/auth/logout-all");
      toast({ title: "Success", description: "Logged out from all devices" });
      clearAuthAndRedirect("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Logout from all devices failed",
        variant: "destructive",
      });
    }
  };

  const needsUpgrade = () => {
    if (!user?.subscription) return false;
    const expiryDate = new Date(user.subscription.expiresAt);
    const currentDate = new Date();
    return user.subscription.plan === "one-week" || expiryDate <= currentDate;
  };

  return (
    <div className="bg-card">
      <div className="p-6 bg-background rounded-t-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">My Account</h1>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-secondary"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Logout from this device
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogoutAll}
                  className="cursor-pointer hover:bg-secondary"
                >
                  <MonitorX className="mr-2 h-4 w-4" />
                  Logout from all devices
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <PersonalDetailsSection
          user={user}
          setUser={setUser}
          fetchUserData={fetchUserData}
          api={api}
        />

        {isGoogleUser && !user?.hasPassword && (
          <CreatePasswordSection api={api} fetchUserData={fetchUserData} />
        )}

        {!user?.phone && (
          <AddPhoneSection api={api} fetchUserData={fetchUserData} />
        )}

        {user?.hasPassword && <PasswordSection api={api} />}

        <DashboardSettingsSection
          settings={settings}
          setSettings={setSettings}
          api={api}
        />

        <SubscriptionPlanSection
          user={user}
          showUpgradeDialog={showUpgradeDialog}
          setShowUpgradeDialog={setShowUpgradeDialog}
          needsUpgrade={needsUpgrade}
        />
      </div>
    </div>
  );
}