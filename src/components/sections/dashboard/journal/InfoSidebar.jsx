import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  isFuture,
  isToday,
  startOfMonth,
  parseISO,
  format,
} from "date-fns";
import { useMonthlyProfitLoss } from "@/hooks/useMonthlyProfitLoss"; // Adjust path as needed
import { cn } from "@/lib/utils";

export function TradingCalendar({ selectedDate, onSelect, tradesPerDay, forceUpdate }) {
  const [month, setMonth] = React.useState(startOfMonth(selectedDate));
  const { profitLossData, isLoading } = useMonthlyProfitLoss(month, forceUpdate); // Pass forceUpdate to hook

  const today = new Date();

  // Define modifiers for calendar days
  const modifiers = {
    future: (date) => isFuture(date),
    today: (date) => isToday(date),
    profit: (date) => {
      // Only apply profit styling if not today
      if (isToday(date)) return false;
      
      const dateKey = format(date, "yyyy-MM-dd");
      return Object.keys(profitLossData).some(
        (key) =>
          format(parseISO(key), "yyyy-MM-dd") === dateKey &&
          profitLossData[key] === "profit"
      );
    },
    loss: (date) => {
      // Only apply loss styling if not today
      if (isToday(date)) return false;
      
      const dateKey = format(date, "yyyy-MM-dd");
      return Object.keys(profitLossData).some(
        (key) =>
          format(parseISO(key), "yyyy-MM-dd") === dateKey &&
          profitLossData[key] === "loss"
      );
    },
    breakeven: (date) => {
      // Only apply breakeven styling if not today
      if (isToday(date)) return false;
      
      const dateKey = format(date, "yyyy-MM-dd");
      return Object.keys(profitLossData).some(
        (key) =>
          format(parseISO(key), "yyyy-MM-dd") === dateKey &&
          profitLossData[key] === "breakeven"
      );
    },
    selected: (date) => {
      // Custom handling for selected date that's not today
      return !isToday(date) && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
    }
  };

  // Define styles for the modifiers
  const modifiersStyles = {
    future: { opacity: 0.5, pointerEvents: "none" },
    today: { 
      backgroundColor: "#6200EA", // Full purple background for today
      color: "white", 
      borderRadius: "4px",
    },
    profit: {
      backgroundColor: "#C0F9E5",
      color: "#0ED991",
      dark: {
        backgroundColor: "rgba(192, 249, 229, 0.2)",
        color: "#0ED991",
      },
    },
    loss: {
      backgroundColor: "#FFD3D8",
      color: "#FF8190",
      dark: {
        backgroundColor: "rgba(255, 211, 216, 0.2)",
        color: "#FF8190",
      },
    },
    breakeven: {
      backgroundColor: "#FFF8B8",
      color: "#FAC300",
      dark: {
        backgroundColor: "rgba(255, 248, 184, 0.2)",
        color: "#FAC300",
      },
    },
    selected: {
      border: "3px solid #6200EA", // Thicker purple border for selected dates
      borderRadius: "4px"
    }
  };

  // Handle month change
  const handleMonthChange = (newMonth) => {
    setMonth(startOfMonth(newMonth));
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full border border-primary/15 bg-background shadow-[0px_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_20px_rgba(0,0,0,0.32)]">
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelect}
            month={month}
            onMonthChange={handleMonthChange}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border-0 flex-1"
            classNames={{
              nav_button_previous: "hover:bg-muted",
              head_cell:
                "text-muted-foreground font-medium text-[0.7rem] w-[2.4rem] text-center",
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-[2.4rem] h-8",
                "[&:has([aria-selected])]:bg-transparent"
              ),
              day: cn(
                "h-8 w-8 p-0 font-normal text-[0.74rem] rounded-[4px]",
                "hover:bg-secondary focus:bg-transparent"
              ),
              day_selected: cn(
                "z-10",
                isToday(selectedDate)
                  ? "bg-[#6200EA] text-white" // Today selected - purple bg, white text
                  : "" // Non-today selection styling handled by modifiersStyles.selected
              ),
              day_today: "bg-[#6200EA] text-white", // Today - always purple bg with white text
            }}
          />
          {/* Legend */}
          <div className="p-3 border-t border-primary/15 flex items-center justify-between gap-1 text-[0.65rem]">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-[3px] bg-[#6200EA]" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-[3px]"
                style={{ backgroundColor: "#0ED991" }}
              />
              <span>Profit</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-[3px]"
                style={{ backgroundColor: "#FF8190" }}
              />
              <span>Loss</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-[3px]"
                style={{ backgroundColor: "#FAC300" }}
              />
              <span>Break Even</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}