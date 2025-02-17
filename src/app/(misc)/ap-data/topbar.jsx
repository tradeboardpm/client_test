import React, { useState, useEffect } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const [theme, setTheme] = useState("system");
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

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

  const handleJoinTradeboard = () => {
    window.open("/sign-up", "_blank");
  };
  

  return (
    <div className="bg-card px-4 py-2 flex justify-between items-center z-10">
      <div className="flex items-center">
        <img
          src="/images/Tradeboard_logo_RGB.png"
          alt="logo"
          className="h-7 object-cover p-1 mt-2"
        />
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="default"
          onClick={handleJoinTradeboard}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Join Tradeboard
        </Button>
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
              {isSelected("light") && (
                <span className="ml-auto">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
              {isSelected("dark") && (
                <span className="ml-auto">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
              {isSelected("system") && (
                <span className="ml-auto">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}