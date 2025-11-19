"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Menu,
  CalendarIcon,
  BarChart,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { JournalSection } from "@/components/sections/dashboard/journal/journal-section";
import { RulesSection } from "@/components/sections/dashboard/rules/rule-section";
import { TradesSection } from "@/components/sections/dashboard/tradelog/trade-log-section";
import { TradingCalendar } from "@/components/sections/dashboard/journal/InfoSidebar";
import { usePointsStore } from "@/stores/points-store";
import { WeeklyCharts } from "@/components/charts/weekly-charts";
import WelcomeMessage from "@/components/sections/dashboard/welcome-message";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create axios instance without static headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to dynamically inject token
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const getUTCDate = (date) => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await api.get(url, options);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [forceCalendarUpdate, setForceCalendarUpdate] = useState(0);
  const [forceChartUpdate, setForceChartUpdate] = useState(0);
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarExpanded");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedSection, setSelectedSection] = useState("calendar");

  const queryClient = useQueryClient();
  const { setPoints } = usePointsStore();
  const userName = Cookies.get("userName") || "Trader";

  // Capital Query
  const { data: capitalData, isLoading: isCapitalLoading } = useQuery({
    queryKey: ["capital"],
    queryFn: async () => {
      const response = await fetchWithRetry("/user/settings");
      const data = response.data;
      localStorage.setItem("lastKnownCapital", data.capital || 0);
      return data;
    },
    select: (data) => ({
      capital: data.capital || Number(localStorage.getItem("lastKnownCapital")) || 0,
      brokerage: data.brokerage || 0,
      points: data.points || 0,
      tradesPerDay: data.tradesPerDay || 4,
    }),
  });

  // Journal Data Query
  const { data: journalData, isLoading: isJournalLoading } = useQuery({
    queryKey: ["journal", selectedDate.toISOString()],
    queryFn: async () => {
      const utcDate = getUTCDate(selectedDate);
      const response = await fetchWithRetry("/journals/details", {
        params: { date: utcDate.toISOString() },
      });
      return response.data;
    },
  });

  // Weekly Metrics Query
  const { data: weeklyMetrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["weeklyMetrics", selectedDate.toISOString()],
    queryFn: async () => {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const response = await fetchWithRetry(`/metrics/weekly?date=${formattedDate}`);
      return response.data || {};
    },
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarExpanded", JSON.stringify(sidebarExpanded));
  }, [sidebarExpanded]);

  useEffect(() => {
    if (capitalData?.points !== undefined) {
      setPoints(capitalData.points);
    }
  }, [capitalData, setPoints]);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setSidebarExpanded(true);
  };

  const handleDateChange = (date) => {
    setSelectedDate(new Date(date));
  };

  const handleChartsUpdate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["capital"] }),
      queryClient.invalidateQueries({ queryKey: ["weeklyMetrics"] }),
    ]);
    setForceChartUpdate((prev) => prev + 1);
  };

  const handleCalendarUpdate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["capital"] }),
      queryClient.invalidateQueries({ queryKey: ["weeklyMetrics"] }),
      queryClient.invalidateQueries({ queryKey: ["journal"] }),
    ]);
    setForceCalendarUpdate((prev) => prev + 1);
    setForceChartUpdate((prev) => prev + 1);
  };

  const handleTradeUpdate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["capital"] });
  };

  const formattedCapital = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(capitalData?.capital || Number(localStorage.getItem("lastKnownCapital")) || 0);

  const isLoading = isCapitalLoading || isJournalLoading || isMetricsLoading;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-card">
      <main className="flex-1 overflow-y-auto p-6 w-full bg-background rounded-t-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex w-full items-center space-x-2">
            <WelcomeMessage
              userName={userName}
              currentTime={currentTime}
              visible={showWelcome}
            />
          </div>
          {isMobile && (
            <Sheet open={isSideSheetOpen} onOpenChange={setIsSideSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[360px] overflow-auto">
                <div className="mt-4">
                  <TradingCalendar
                    selectedDate={selectedDate}
                    onSelect={handleDateChange}
                    tradesPerDay={capitalData?.tradesPerDay}
                    forceUpdate={forceCalendarUpdate}
                  />
                  <WeeklyCharts
                    selectedDate={selectedDate}
                    tradesPerDay={capitalData?.tradesPerDay}
                    forceUpdate={forceChartUpdate}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="primary_gradient rounded-xl p-2 sm:p-3 md:p-4 lg:p-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 md:gap-4">
            <div className="flex-1 sm:w-auto min-w-0 order-2 sm:order-1"></div>
            <div className="flex-1 w-full flex-shrink-0 sm:w-auto sm:flex-0 sm:max-w-[50%] md:max-w-[50%] bg-[#ffffff]/30 text-center text-background px-2 py-1 rounded-lg mb-2 sm:mb-0 order-1 sm:order-2">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl px-2 sm:px-3 py-1 font-semibold">
                {formatDate(selectedDate)}
              </p>
            </div>
            <p className="flex-1 text-right w-full flex-shrink-0 text-background text-xs sm:text-sm md:text-base lg:text-lg order-3 px-2 sm:px-3 md:px-4 whitespace-nowrap">
              Capital: {isCapitalLoading ? "Loading..." : formattedCapital}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <JournalSection
            selectedDate={selectedDate}
            journalData={journalData}
            onJournalChange={handleCalendarUpdate}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ["journal"] })}
          />
          <RulesSection
            selectedDate={selectedDate}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ["journal"] })}
            onRulesChange={handleCalendarUpdate}
          />
        </div>
        <TradesSection
          selectedDate={selectedDate}
          onUpdate={() => queryClient.invalidateQueries({ queryKey: ["journal"] })}
          onTradeChange={handleCalendarUpdate}
          onCapitalUpdate={handleTradeUpdate}
          brokerage={capitalData?.brokerage}
          trades={journalData?.trades || []}
        />
      </main>

      {!isMobile && (
        <div
          className={`relative h-full transition-all duration-300 ease-in-out bg-card ${
            sidebarExpanded ? "w-[20.5rem]" : "w-16"
          }`}
        >
          {sidebarExpanded ? (
            <div className="p-4 space-y-6">
              <TradingCalendar
                selectedDate={selectedDate}
                onSelect={handleDateChange}
                tradesPerDay={capitalData?.tradesPerDay}
                forceUpdate={forceCalendarUpdate}
              />
              <WeeklyCharts
                selectedDate={selectedDate}
                tradesPerDay={capitalData?.tradesPerDay}
                forceUpdate={forceChartUpdate}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 pt-6 bg-card">
              <Button
                variant="ghost"
                size="icon"
                className="bg-transparent"
                onClick={() => handleSectionClick("calendar")}
              >
                <CalendarIcon className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-transparent"
                onClick={() => handleSectionClick("charts")}
              >
                <BarChart className="size-5" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className="absolute top-1/2 p-0 -left-5 z-10 h-8 w-8 rounded-full bg-card shadow-md border-none flex items-center justify-center transform -translate-y-1/2 border border-border"
          >
            {!sidebarExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}