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
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { JournalSection } from "@/components/sections/dashboard/journal/journal-section";
import { RulesSection } from "@/components/sections/dashboard/rules/rule-section";
import { TradesSection } from "@/components/sections/dashboard/tradelog/trade-log-section";
import { TradingCalendar } from "@/components/sections/dashboard/journal/InfoSidebar";
import { usePointsStore } from "@/stores/points-store";
import { WeeklyCharts } from "@/components/charts/weekly-charts";
import WelcomeMessage from "@/components/sections/dashboard/welcome-message";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

const formatTime = (date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${Cookies.get("token")}`,
    "Content-Type": "application/json",
  },
});

export default function JournalTradePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [journalData, setJournalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [capital, setCapital] = useState(0);
  const [brokerage, setBrokerage] = useState(0);
  const [tradesPerDay, setTradesPerDay] = useState(4);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarExpanded");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [weeklyMetrics, setWeeklyMetrics] = useState({});
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const [forceChartUpdate, setForceChartUpdate] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  const { setPoints } = usePointsStore();

  const userName = Cookies.get("userName") || "Trader";
  const subscription = Cookies.get("subscription");

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
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchJournalData(), fetchCapital(), fetchWeeklyMetrics()]);
      setIsLoading(false);
    };

    fetchData();
  }, [selectedDate]);

  const fetchCapital = async () => {
    try {
      const response = await api.get("/user/settings");
      setCapital(response.data.capital);
      setBrokerage(response.data.brokerage);
      setPoints(response.data.points);
      setTradesPerDay(response.data.tradesPerDay);
      usePointsStore.getState().setPoints(response.data.points);
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  const fetchWeeklyMetrics = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const response = await api.get(`/metrics/weekly?date=${formattedDate}`);
      setWeeklyMetrics(response.data || {});
    } catch (error) {
      console.error("Error fetching weekly metrics:", error);
    }
  };

  const fetchJournalData = async () => {
    const utcDate = getUTCDate(selectedDate);

    try {
      const response = await api.get("/journals/details", {
        params: { date: utcDate.toISOString() },
      });
      setJournalData(response.data);
    } catch (error) {
      console.error("Error fetching journal data:", error);
      setJournalData(null);
    }
  };

  const [selectedSection, setSelectedSection] = useState("calendar");

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setSidebarExpanded(true);
  };

  const handleDateChange = (date) => {
    const adjustedDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    setSelectedDate(adjustedDate);

    if (isMobile) {
      setIsSideSheetOpen(false);
    }
  };

  const handleChartsUpdate = async () => {
    await Promise.all([fetchCapital(), fetchWeeklyMetrics()]);
    setForceChartUpdate((prev) => prev + 1);
  };

  const formattedCapital = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(capital);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

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
                <div className="mt-4 ">
                  <TradingCalendar
                    selectedDate={selectedDate}
                    onSelect={handleDateChange}
                  />

                  <div>
                    <WeeklyCharts
                      selectedDate={selectedDate}
                      tradesPerDay={tradesPerDay}
                      forceUpdate={forceChartUpdate}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="primary_gradient rounded-xl p-2 sm:p-3 md:p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center relative">
            <div className="flex-1 w-full sm:w-auto order-2 sm:order-1"></div>
            <div className="w-full sm:w-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2 bg-[#ffffff]/30 text-center text-background px-2 py-1 rounded-lg mb-2 sm:mb-0 order-1 sm:order-2">
              <p className="text-lg px-3 py-1 font-semibold">{formatDate(selectedDate)}</p>
            </div>
            <p className="text-background text-sm sm:text-base lg:text-xl order-3 px-4">
              Capital: {formattedCapital}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5  mb-8">
          <JournalSection
            selectedDate={selectedDate}
            journalData={journalData}
          />
          <RulesSection
            selectedDate={selectedDate}
            onUpdate={fetchJournalData}
            onRulesChange={handleChartsUpdate}
          />
        </div>

        <div>
          <TradesSection
            selectedDate={selectedDate}
            onUpdate={fetchJournalData}
            brokerage={brokerage}
            trades={journalData?.trades || []}
            onTradeChange={handleChartsUpdate}
          />
        </div>
      </main>

      <div className="relative flex">
        {!isMobile && (
          <div
            className={`relative h-full transition-all duration-300 ease-in-out  bg-card ${
              sidebarExpanded ? "w-[20.5rem]" : "w-16 "
            }`}
          >
            {sidebarExpanded ? (
              <div className="p-4 space-y-6">
                <TradingCalendar
                  selectedDate={selectedDate}
                  onSelect={handleDateChange}
                />

                <div>
                  <WeeklyCharts
                    selectedDate={selectedDate}
                    tradesPerDay={tradesPerDay}
                    forceUpdate={forceChartUpdate}
                  />
                </div>
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
    </div>
  );
}