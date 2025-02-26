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
import {
  useMonthlyProfitLoss,
} from "@/hooks/useMonthlyProfitLoss";
// import { WeeklyCharts } from "../../../charts/weekly-charts";
import { cn } from "@/lib/utils";

export function TradingCalendar({ selectedDate, onSelect, tradesPerDay }) {
  const [month, setMonth] = React.useState(startOfMonth(selectedDate));
  const { profitLossData, isLoading } = useMonthlyProfitLoss(month);

  const today = new Date();

  const modifiers = {
    future: (date) => isFuture(date),
    today: (date) => isToday(date),
    profit: (date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      return Object.keys(profitLossData).some(
        (key) =>
          format(parseISO(key), "yyyy-MM-dd") === dateKey &&
          profitLossData[key] === "profit"
      );
    },
    loss: (date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      return Object.keys(profitLossData).some(
        (key) =>
          format(parseISO(key), "yyyy-MM-dd") === dateKey &&
          profitLossData[key] === "loss"
      );
    },
    breakeven: (date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      return Object.keys(profitLossData).some(
        (key) =>
          format(parseISO(key), "yyyy-MM-dd") === dateKey &&
          profitLossData[key] === "breakeven"
      );
    },
  };

  const modifiersStyles = {
    future: { opacity: 0.5, pointerEvents: "none" },
    today: { border: "2px solid purple" },
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
  };

  const handleMonthChange = (newMonth) => {
    setMonth(startOfMonth(newMonth));
  };

  return (
    <div className="flex flex-col gap-4 ">
      <Card className="w-full border border-primary/15 bg-background  shadow-[0px_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_20px_rgba(0,0,0,0.32)]">
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
                "border border-primary shadow hover:text-primary-foreground z-10",
                isToday(selectedDate) ? "border-purple-500 bg-purple-100 dark:bg-purple-900" : "bg-card"
              ),
              
            }}
          />
          {/* Legend */}
          <div className="p-3 border-t border-primary/15 flex items-center justify-between gap-1 text-[0.65rem]">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-[3px] bg-purple-500" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-[3px]"
                style={{
                  backgroundColor: "#0ED991",
                }}
              />
              <span>Profit</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-[3px]"
                style={{
                  backgroundColor: "#FF8190",
                }}
              />
              <span>Loss</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-[3px]"
                style={{
                  backgroundColor: "#FAC300",
                }}
              />
              <span>Break Even</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
