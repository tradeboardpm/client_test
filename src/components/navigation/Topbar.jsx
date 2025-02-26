import React, { useState, useEffect } from "react";
import { Bell, Menu, Sun, Moon, Laptop, LogOut, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const NotificationItem = ({ title, content, validUntil, type }) => {
  // Format the date to be more readable
  const formattedDate = new Date(validUntil).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mb-4 p-3 rounded-lg border bg-card">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{content}</p>
      <p className="text-xs mt-1 text-muted-foreground">
        Valid until: {formattedDate}
      </p>
    </div>
  );
};

export default function Topbar({
  toggleSidebar,
  onLogout,
  notifications = [],
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState("system");
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const name = Cookies.get("userName");
    if (name) {
      setUsername(name);
    }

    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Update hasNewNotifications when notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      setHasNewNotifications(true);
    }
  }, [notifications]);

  const handleSheetOpen = (open) => {
    setIsSheetOpen(open);
    if (open) {
      setHasNewNotifications(false);
    }
  };

  const applyTheme = (newTheme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme = newTheme;
    if (newTheme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    root.classList.add(effectiveTheme);
    root.style.colorScheme = effectiveTheme;
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const isSelected = (value) => theme === value;

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-6 w-6" />;
      case "dark":
        return <Moon className="h-6 w-6" />;
      default:
        return <Laptop className="h-6 w-6" />;
    }
  };

  const handleAccountClick = () => {
    router.push("/my-account");
  };

  return (
    <div className="bg-card px-4 py-2 flex justify-between items-center z-10">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <img
          src="/images/Tradeboard_logo_RGB.png"
          alt="logo"
          className="h-7 object-cover p-1 mt-2"
        />
      </div>
      <div className="flex items-center space-x-4">
        <Sheet open={isSheetOpen} onOpenChange={handleSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              {hasNewNotifications && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[360px]">
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    title={notification.title}
                    content={notification.content}
                    validUntil={notification.validUntil}
                    type={notification.type}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  No notifications
                </p>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {getThemeIcon()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Choose theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => changeTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
              {isSelected("light") && <span className="ml-auto"><Check className="w-4 h-4" /></span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
              {isSelected("dark") && <span className="ml-auto"><Check className="w-4 h-4" /></span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
              {isSelected("system") && <span className="ml-auto"><Check className="w-4 h-4" /></span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleAccountClick}
        >
          <Avatar>
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>
              {username ? username.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold hidden sm:inline ml-2">
            {username || "User"}
          </span>
        </div>
      </div>
    </div>
  );
}
